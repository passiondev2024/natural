import {Apollo, gql} from 'apollo-angular';
import {FetchResult, NetworkStatus, WatchQueryFetchPolicy} from '@apollo/client/core';
import {AbstractControl, AsyncValidatorFn, FormControl, FormGroup, ValidatorFn} from '@angular/forms';

import {DocumentNode} from 'graphql';

import {defaults, merge, mergeWith, omit, pick} from 'lodash-es';
import {EMPTY, Observable, of, OperatorFunction, ReplaySubject, Subject} from 'rxjs';
import {debounceTime, filter, map, mergeMap, shareReplay, switchMap, take, takeWhile, tap} from 'rxjs/operators';
import {NaturalQueryVariablesManager, QueryVariables} from '../classes/query-variable-manager';
import {Literal} from '../types/types';
import {makePlural, mergeOverrideArray, relationsToIds, upperCaseFirstLetter} from '../classes/utility';
import {PaginatedData} from '../classes/data-source';

export interface FormValidators {
    [key: string]: ValidatorFn[];
}

export interface FormAsyncValidators {
    [key: string]: AsyncValidatorFn[];
}

export interface VariablesWithInput {
    input: Literal;
}

export interface FormControls {
    [key: string]: AbstractControl;
}

interface Resolve<TOne> {
    model: TOne;
}

export type WithId<T> = {id: string} & T;

export abstract class NaturalAbstractModelService<
    Tone,
    Vone extends {id: string},
    Tall extends PaginatedData<Literal>,
    Vall extends QueryVariables,
    Tcreate,
    Vcreate extends VariablesWithInput,
    Tupdate,
    Vupdate extends {id: string; input: Literal},
    Tdelete,
    Vdelete extends {ids: string[]},
> {
    /**
     * Stores the debounced update function
     */
    private debouncedUpdateCache = new Map<
        string,
        {
            source: Subject<void>;
            canceller: Subject<void>;
            result: Observable<Tupdate>;
        }
    >();

    /**
     * Store the creation mutations that are pending
     */
    private readonly creatingCache = new Map<Vcreate['input'] | WithId<Vupdate['input']>, Observable<Tcreate>>();

    public constructor(
        protected readonly apollo: Apollo,
        protected readonly name: string,
        protected readonly oneQuery: DocumentNode | null,
        protected readonly allQuery: DocumentNode | null,
        protected readonly createMutation: DocumentNode | null,
        protected readonly updateMutation: DocumentNode | null,
        protected readonly deleteMutation: DocumentNode | null,
    ) {}

    public getConsolidatedForClient(): Literal {
        return Object.assign(this.getDefaultForServer(), this.getDefaultForClient());
    }

    /**
     * List of individual fields validators
     */
    public getFormValidators(model?: Literal): FormValidators {
        return {};
    }

    /**
     * List of individual async fields validators
     */
    public getFormAsyncValidators(model?: Literal): FormAsyncValidators {
        return {};
    }

    /**
     * List of grouped fields validators (like password + confirm password)
     */
    public getFormGroupValidators(model?: Literal): ValidatorFn[] {
        return [];
    }

    /**
     * List of async group fields validators (like unique constraint on multiple columns)
     */
    public getFormGroupAsyncValidators(model?: Literal): AsyncValidatorFn[] {
        return [];
    }

    public getFormConfig(model: Literal): FormControls {
        const values = this.getConsolidatedForClient();
        const validators = this.getFormValidators(model);
        const asyncValidators = this.getFormAsyncValidators(model);
        const controls: FormControls = {};
        const disabled = model.permissions ? !model.permissions.update : false;

        if (model.id) {
            controls['id'] = new FormControl({value: model.id, disabled: true});
        }

        // Configure form for each field of model
        for (const key of Object.keys(values)) {
            const value = model[key] !== undefined ? model[key] : values[key];
            const formState = {
                value: value,
                disabled: disabled,
            };
            const validator = typeof validators[key] !== 'undefined' ? validators[key] : null;
            const asyncValidator = typeof asyncValidators[key] !== 'undefined' ? asyncValidators[key] : null;

            controls[key] = new FormControl(formState, validator, asyncValidator);
        }

        // Configure form for extra validators that are not on a specific field
        for (const key of Object.keys(validators)) {
            if (!controls[key]) {
                const formState = {
                    value: model[key] ? model[key] : null,
                    disabled: disabled,
                };

                controls[key] = new FormControl(formState, validators[key]);
            }
        }

        for (const key of Object.keys(asyncValidators)) {
            if (controls[key] && asyncValidators[key]) {
                controls[key].setAsyncValidators(asyncValidators[key]);
            } else {
                const formState = {
                    value: model[key] ? model[key] : null,
                    disabled: disabled,
                };

                controls[key] = new FormControl(formState, null, asyncValidators[key]);
            }
        }

        return controls;
    }

    /**
     * Create the final FormGroup for the object, including all validators
     *
     * This method should **not** be overridden, but instead `getFormConfig`,
     * `getFormGroupValidators`, `getFormGroupAsyncValidators` might be.
     */
    public getFormGroup(model: Literal): FormGroup {
        const formConfig = this.getFormConfig(model);
        return new FormGroup(formConfig, {
            validators: this.getFormGroupValidators(model),
            asyncValidators: this.getFormGroupAsyncValidators(model),
        });
    }

    /**
     * Get a single object
     *
     * If available it will emit object from cache immediately, then it
     * will **always** fetch from network and then the observable will be completed
     */
    public getOne(id: string): Observable<Tone> {
        this.throwIfObservable(id);
        this.throwIfNotQuery(this.oneQuery);

        const queryRef = this.apollo.watchQuery<Tone, Vone>({
            query: this.oneQuery,
            variables: this.getVariablesForOne(id),
            fetchPolicy: 'cache-and-network',
            nextFetchPolicy: 'cache-only',
        });

        return queryRef.valueChanges.pipe(
            filter(result => !!result.data),
            takeWhile(result => result.networkStatus !== NetworkStatus.ready, true),
            map(result => (result.data as Literal)[this.name]),
        );
    }

    /**
     * Get a collection of objects
     *
     * It will **always** fetch from network and then the observable will be completed.
     * No cache is ever used, so it's slow but correct.
     */
    public getAll(queryVariablesManager: NaturalQueryVariablesManager<Vall>): Observable<Tall> {
        this.throwIfNotQuery(this.allQuery);

        // Copy manager to prevent to apply internal variables to external QueryVariablesManager
        const manager = new NaturalQueryVariablesManager<Vall>(queryVariablesManager);
        manager.merge('partial-variables', this.getPartialVariablesForAll());

        return this.apollo
            .query<Tall, Vall>({
                query: this.allQuery,
                variables: manager.variables.value,
                fetchPolicy: 'network-only',
            })
            .pipe(this.mapAll());
    }

    /**
     * Get a collection of objects
     *
     * Every time the observable variables change, and they are not undefined,
     * it will return result from cache, then it will **always** fetch from network.
     *
     * You must subscribe to start getting results (and fetch from network).
     *
     * The observable result will only complete when unsubscribing. That means you **must** unsubscribe.
     */
    public watchAll(
        queryVariablesManager: NaturalQueryVariablesManager<Vall>,
        fetchPolicy: WatchQueryFetchPolicy = 'cache-and-network',
    ): Observable<Tall> {
        this.throwIfNotQuery(this.allQuery);

        return queryVariablesManager.variables.pipe(
            // Ignore very fast variable changes
            debounceTime(20),
            // Wait for variables to be defined to prevent duplicate query: with and without variables
            // Null is accepted value for "no variables"
            filter(variables => typeof variables !== 'undefined'),
            switchMap(() => {
                // Apply partial variables from service
                // Copy manager to prevent to apply internal variables to external QueryVariablesManager
                const manager = new NaturalQueryVariablesManager<Vall>(queryVariablesManager);
                manager.merge('partial-variables', this.getPartialVariablesForAll());

                this.throwIfNotQuery(this.allQuery);

                return this.apollo
                    .watchQuery<Tall, Vall>({
                        query: this.allQuery,
                        variables: manager.variables.value,
                        fetchPolicy: fetchPolicy,
                    })
                    .valueChanges.pipe(
                        filter(r => !!r.data),
                        this.mapAll(),
                    );
            }),
        );
    }

    /**
     * This functions allow to quickly create or update objects.
     *
     * Manages a "creation is pending" status, and update when creation is ready.
     * Uses regular update/updateNow and create methods.
     * Used mainly when editing multiple objects in same controller (like in editable arrays)
     */
    public createOrUpdate(
        object: Vcreate['input'] | WithId<Vupdate['input']>,
        now: boolean = false,
    ): Observable<Tcreate | Tupdate> {
        this.throwIfObservable(object);
        this.throwIfNotQuery(this.createMutation);
        this.throwIfNotQuery(this.updateMutation);

        // If creation is pending, listen to creation observable and when ready, fire update
        const pendingCreation = this.creatingCache.get(object);
        if (pendingCreation) {
            return pendingCreation.pipe(
                switchMap(() => {
                    return this.update(object as WithId<Vupdate['input']>);
                }),
            );
        }

        // If object has Id, just save it
        if ('id' in object && object.id) {
            if (now) {
                // used mainly for tests, because lodash debounced used in update() does not work fine with fakeAsync and tick()
                return this.updateNow(object as WithId<Vupdate['input']>);
            } else {
                return this.update(object as WithId<Vupdate['input']>);
            }
        }

        // If object was not saving, and has no ID, create it
        const creation = this.create(object).pipe(
            tap(() => {
                this.creatingCache.delete(object); // remove from cache
            }),
        );

        // stores creating observable in a cache replayable version of the observable,
        // so several update() can subscribe to the same creation
        this.creatingCache.set(object, creation.pipe(shareReplay()));

        return creation;
    }

    /**
     * Create an object in DB and then refetch the list of objects
     */
    public create(object: Vcreate['input']): Observable<Tcreate> {
        this.throwIfObservable(object);
        this.throwIfNotQuery(this.createMutation);

        const variables = merge(
            {},
            {input: this.getInput(object)},
            this.getPartialVariablesForCreation(object),
        ) as Vcreate;

        return this.apollo
            .mutate<Tcreate, Vcreate>({
                mutation: this.createMutation,
                variables: variables,
            })
            .pipe(
                map(result => {
                    this.apollo.client.reFetchObservableQueries();
                    const newObject = this.mapCreation(result);

                    if (newObject) {
                        return mergeWith(object, newObject, mergeOverrideArray);
                    } else {
                        return newObject;
                    }
                }),
            );
    }

    /**
     * Update an object, after a short debounce
     */
    public update(object: WithId<Vupdate['input']>): Observable<Tupdate> {
        this.throwIfObservable(object);
        this.throwIfNotQuery(this.updateMutation);

        // Keep a single instance of the debounced update function
        const id = object.id;
        let debounced = this.debouncedUpdateCache.get(id);

        if (!debounced) {
            const source = new ReplaySubject<void>(1);
            let wasCancelled = false;
            const canceller = new Subject<void>();
            canceller.subscribe(() => {
                wasCancelled = true;
                source.complete();
                canceller.complete();
            });

            // Create debounced update function
            const result = source.pipe(
                debounceTime(2000), // Wait 2sec.
                take(1),
                mergeMap(() => {
                    this.debouncedUpdateCache.delete(id);
                    if (wasCancelled) {
                        return EMPTY;
                    }

                    return this.updateNow(object);
                }),
                shareReplay(), // All attempts to update will share the exact same single result from API
            );

            debounced = {
                source,
                canceller,
                result,
            };

            this.debouncedUpdateCache.set(id, debounced);
        }

        // Notify our debounced update each time we ask to update
        debounced.source.next();

        // Return and observable that is updated when mutation is done
        return debounced.result;
    }

    /**
     * Update an object immediately when subscribing
     */
    public updateNow(object: WithId<Vupdate['input']>): Observable<Tupdate> {
        this.throwIfObservable(object);
        this.throwIfNotQuery(this.updateMutation);

        const variables = merge(
            {
                id: object.id,
                input: this.getInput(object),
            },
            this.getPartialVariablesForUpdate(object),
        ) as Vupdate;

        return this.apollo
            .mutate<Tupdate, Vupdate>({
                mutation: this.updateMutation,
                variables: variables,
            })
            .pipe(
                map(result => {
                    this.apollo.client.reFetchObservableQueries();
                    const mappedResult = this.mapUpdate(result);

                    return mergeWith(object, mappedResult, mergeOverrideArray);
                }),
            );
    }

    /**
     * Update an object but without automatically injecting values coming
     * from `getDefaultForServer()`.
     */
    public updatePartially(object: WithId<Vupdate['input']>): Observable<Tupdate> {
        this.throwIfObservable(object);
        this.throwIfNotQuery(this.updateMutation);

        const variables = {
            id: object.id,
            input: omit(relationsToIds(object), 'id'),
        } as Vupdate;

        return this.apollo
            .mutate<Tupdate, Vupdate>({
                mutation: this.updateMutation,
                variables: variables,
            })
            .pipe(
                map(result => {
                    this.apollo.client.reFetchObservableQueries();
                    return this.mapUpdate(result);
                }),
            );
    }

    /**
     * Delete objects and then refetch the list of objects
     */
    public delete(objects: {id: string}[]): Observable<Tdelete> {
        this.throwIfObservable(objects);
        this.throwIfNotQuery(this.deleteMutation);

        const ids = objects.map(o => {
            // Cancel pending update
            const debounced = this.debouncedUpdateCache.get(o.id);
            debounced?.canceller.next();

            return o.id;
        });
        const variables = merge(
            {
                ids: ids,
            },
            this.getPartialVariablesForDelete(objects),
        ) as Vdelete;

        return this.apollo
            .mutate<Tdelete, Vdelete>({
                mutation: this.deleteMutation,
                variables: variables,
            })
            .pipe(
                map(result => {
                    this.apollo.client.reFetchObservableQueries();

                    return this.mapDelete(result);
                }),
            );
    }

    /**
     * Resolve model and items related to the model, if the id is provided, in order to show a form
     */
    public resolve(id: string): Observable<Resolve<Tone>> {
        // Load model if id is given
        let observable;
        if (id) {
            observable = this.getOne(id);
        } else {
            observable = of(this.getConsolidatedForClient() as Tone);
        }

        return observable.pipe(
            map(result => {
                return {model: result};
            }),
        );
    }

    /**
     * Return an object that match the GraphQL input type.
     * It creates an object with manually filled data and add uncompleted data (like required attributes that can be empty strings)
     */
    public getInput(object: Literal): Vcreate['input'] | Vupdate['input'] {
        // Convert relations to their IDs for mutation
        object = relationsToIds(object);

        // Pick only attributes that we can find in the empty object
        // In other words, prevent to select data that has unwanted attributes
        const emptyObject = this.getDefaultForServer();
        let input = pick(object, Object.keys(emptyObject));

        // Complete a potentially uncompleted object with default values
        input = defaults(input, emptyObject);

        return input;
    }

    /**
     * Return the number of objects matching the query
     *
     * This is used for the unique validator
     */
    public count(queryVariablesManager: NaturalQueryVariablesManager<Vall>): Observable<number> {
        const plural = makePlural(this.name);
        const queryName = 'Count' + upperCaseFirstLetter(plural);
        const filterType = upperCaseFirstLetter(this.name) + 'Filter';

        // Copy manager to prevent to apply internal variables to external QueryVariablesManager
        const manager = new NaturalQueryVariablesManager<Vall>(queryVariablesManager);
        manager.merge('partial-variables', this.getPartialVariablesForAll());

        const query = gql`
            query ${queryName} ($filter: ${filterType}) {
            count: ${plural} (filter: $filter, pagination: {pageSize: 0, pageIndex: 0}) {
            length
            }
            }`;

        return this.apollo
            .query<{count: {length: number}}, Vall>({
                query: query,
                variables: manager.variables.value,
                fetchPolicy: 'network-only',
            })
            .pipe(map(result => result.data.count.length));
    }

    /**
     * Return empty object with some default values from server perspective
     *
     * This is typically useful when showing a form for creation
     */
    protected getDefaultForServer(): Vcreate['input'] | Vupdate['input'] {
        return {};
    }

    /**
     * Return empty object with some default values from frontend perspective
     *
     * Where empty object must respect graphql XXXInput type, may need some default values for other fields
     */
    protected getDefaultForClient(): Literal {
        return {};
    }

    /**
     * This is used to extract only the array of fetched objects out of the entire fetched data
     */
    protected mapAll(): OperatorFunction<FetchResult<unknown>, Tall> {
        const plural = makePlural(this.name);
        return map(result => (result.data as any)[plural]); // See https://github.com/apollographql/apollo-client/issues/5662
    }

    /**
     * This is used to extract only the created object out of the entire fetched data
     */
    protected mapCreation(result: FetchResult): Tcreate {
        const name = 'create' + upperCaseFirstLetter(this.name);
        return (result.data as any)[name]; // See https://github.com/apollographql/apollo-client/issues/5662
    }

    /**
     * This is used to extract only the updated object out of the entire fetched data
     */
    protected mapUpdate(result: FetchResult): Tupdate {
        const name = 'update' + upperCaseFirstLetter(this.name);
        return (result.data as any)[name]; // See https://github.com/apollographql/apollo-client/issues/5662
    }

    /**
     * This is used to extract only flag when deleting an object
     */
    protected mapDelete(result: FetchResult): Tdelete {
        const name = 'delete' + makePlural(upperCaseFirstLetter(this.name));
        return (result.data as any)[name]; // See https://github.com/apollographql/apollo-client/issues/5662
    }

    /**
     * Returns additional variables to be used when getting a single object
     *
     * This is typically a site or state ID, and is needed to get appropriate access rights
     */
    protected getPartialVariablesForOne(): Partial<Vone> {
        return {};
    }

    /**
     * Returns additional variables to be used when getting multiple objects
     *
     * This is typically a site or state ID, but it could be something else to further filter the query
     */
    public getPartialVariablesForAll(): Partial<Vall> {
        return {};
    }

    /**
     * Returns additional variables to be used when creating an object
     *
     * This is typically a site or state ID
     */
    protected getPartialVariablesForCreation(object: Literal): Partial<Vcreate> {
        return {};
    }

    /**
     * Returns additional variables to be used when updating an object
     *
     * This is typically a site or state ID
     */
    protected getPartialVariablesForUpdate(object: Literal): Partial<Vupdate> {
        return {};
    }

    /**
     * Return additional variables to be used when deleting an object
     *
     * This is typically a site or state ID
     */
    protected getPartialVariablesForDelete(objects: Literal[]): Partial<Vdelete> {
        return {};
    }

    /**
     * Throw exception to prevent executing queries with invalid variables
     */
    protected throwIfObservable(value: any): void {
        if (value instanceof Observable) {
            throw new Error(
                'Cannot use Observable as variables. Instead you should use .subscribe() to call the method with a real value',
            );
        }
    }

    /**
     * Merge given ID with additional partial variables if there is any
     */
    private getVariablesForOne(id: string): Vone {
        return merge({}, {id: id}, this.getPartialVariablesForOne()) as Vone;
    }

    /**
     * Throw exception to prevent executing null queries
     */
    private throwIfNotQuery(query: DocumentNode | null): asserts query {
        if (!query) {
            throw new Error('GraphQL query for this method was not configured in this service constructor');
        }
    }
}
