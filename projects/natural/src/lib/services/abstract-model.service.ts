import {Apollo, gql, MutationResult} from 'apollo-angular';
import {FetchResult, NetworkStatus, WatchQueryFetchPolicy} from '@apollo/client/core';
import {AbstractControl, AsyncValidatorFn, UntypedFormControl, UntypedFormGroup, ValidatorFn} from '@angular/forms';
import {DocumentNode} from 'graphql';
import {defaults, merge, mergeWith, omit, pick} from 'lodash-es';
import {catchError, combineLatest, EMPTY, first, from, Observable, of, OperatorFunction} from 'rxjs';
import {debounceTime, filter, map, shareReplay, switchMap, takeWhile, tap} from 'rxjs/operators';
import {NaturalQueryVariablesManager, QueryVariables} from '../classes/query-variable-manager';
import {Literal} from '../types/types';
import {makePlural, mergeOverrideArray, relationsToIds, upperCaseFirstLetter} from '../classes/utility';
import {PaginatedData} from '../classes/data-source';
import {NaturalDebounceService} from './debounce.service';

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
     * Store the creation mutations that are pending
     */
    private readonly creatingCache = new Map<Vcreate['input'] | WithId<Vupdate['input']>, Observable<Tcreate>>();

    public constructor(
        protected readonly apollo: Apollo,
        protected readonly naturalDebounceService: NaturalDebounceService,
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public getFormValidators(model?: Literal): FormValidators {
        return {};
    }

    /**
     * List of individual async fields validators
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public getFormAsyncValidators(model?: Literal): FormAsyncValidators {
        return {};
    }

    /**
     * List of grouped fields validators (like password + confirm password)
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public getFormGroupValidators(model?: Literal): ValidatorFn[] {
        return [];
    }

    /**
     * List of async group fields validators (like unique constraint on multiple columns)
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
            controls['id'] = new UntypedFormControl({value: model.id, disabled: true});
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

            controls[key] = new UntypedFormControl(formState, validator, asyncValidator);
        }

        // Configure form for extra validators that are not on a specific field
        for (const key of Object.keys(validators)) {
            if (!controls[key]) {
                const formState = {
                    value: model[key] ? model[key] : null,
                    disabled: disabled,
                };

                controls[key] = new UntypedFormControl(formState, validators[key]);
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

                controls[key] = new UntypedFormControl(formState, null, asyncValidators[key]);
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
    public getFormGroup(model: Literal): UntypedFormGroup {
        const formConfig = this.getFormConfig(model);
        return new UntypedFormGroup(formConfig, {
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

        return this.getVariablesForOne(id).pipe(
            switchMap(variables => {
                this.throwIfNotQuery(this.oneQuery);

                return this.apollo.watchQuery<unknown, Vone>({
                    query: this.oneQuery,
                    variables: variables,
                    fetchPolicy: 'cache-and-network',
                    nextFetchPolicy: 'cache-only',
                }).valueChanges;
            }),
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

        return this.getPartialVariablesForAll().pipe(
            first(),
            switchMap(partialVariables => {
                this.throwIfNotQuery(this.allQuery);

                // Copy manager to prevent to apply internal variables to external QueryVariablesManager
                const manager = new NaturalQueryVariablesManager<Vall>(queryVariablesManager);
                manager.merge('partial-variables', partialVariables);

                return this.apollo.query<unknown, Vall>({
                    query: this.allQuery,
                    variables: manager.variables.value,
                    fetchPolicy: 'network-only',
                });
            }),
            this.mapAll(),
        );
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

        return combineLatest({
            variables: queryVariablesManager.variables.pipe(
                // Ignore very fast variable changes
                debounceTime(20),
                // Wait for variables to be defined to prevent duplicate query: with and without variables
                // Null is accepted value for "no variables"
                filter(variables => typeof variables !== 'undefined'),
            ),
            partialVariables: this.getPartialVariablesForAll(),
        }).pipe(
            switchMap(result => {
                // Apply partial variables from service
                // Copy manager to prevent to apply internal variables to external QueryVariablesManager
                const manager = new NaturalQueryVariablesManager<Vall>(queryVariablesManager);
                manager.merge('partial-variables', result.partialVariables);

                this.throwIfNotQuery(this.allQuery);

                return this.apollo
                    .watchQuery<unknown, Vall>({
                        query: this.allQuery,
                        variables: manager.variables.value,
                        fetchPolicy: fetchPolicy,
                    })
                    .valueChanges.pipe(
                        catchError(() => EMPTY),
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
        now = false,
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

        return this.naturalDebounceService.debounce(this, id, this.updateNow(object));
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
            this.naturalDebounceService.cancel(this, o.id);

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
                // Delay the observable until Apollo refetch is completed
                switchMap(result => {
                    const mappedResult = this.mapDelete(result);

                    return from(this.apollo.client.reFetchObservableQueries()).pipe(map(() => mappedResult));
                }),
            );
    }

    /**
     * Resolve model and items related to the model, if the id is provided, in order to show a form
     */
    public resolve(id: string): Observable<Resolve<Tone>> {
        // Load model if id is given
        let observable: Observable<Tone>;
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
     * Return the number of objects matching the query. It may never complete.
     *
     * This is used for the unique validator
     */
    public count(queryVariablesManager: NaturalQueryVariablesManager<Vall>): Observable<number> {
        const plural = makePlural(this.name);
        const queryName = 'Count' + upperCaseFirstLetter(plural);
        const filterType = upperCaseFirstLetter(this.name) + 'Filter';

        const query = gql`
            query ${queryName} ($filter: ${filterType}) {
            count: ${plural} (filter: $filter, pagination: {pageSize: 0, pageIndex: 0}) {
            length
            }
            }`;

        return this.getPartialVariablesForAll().pipe(
            switchMap(partialVariables => {
                // Copy manager to prevent to apply internal variables to external QueryVariablesManager
                const manager = new NaturalQueryVariablesManager<Vall>(queryVariablesManager);
                manager.merge('partial-variables', partialVariables);

                return this.apollo.query<{count: {length: number}}, Vall>({
                    query: query,
                    variables: manager.variables.value,
                    fetchPolicy: 'network-only',
                });
            }),
            map(result => result.data.count.length),
        );
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
    protected mapCreation(result: MutationResult<unknown>): Tcreate {
        const name = 'create' + upperCaseFirstLetter(this.name);
        return (result.data as any)[name]; // See https://github.com/apollographql/apollo-client/issues/5662
    }

    /**
     * This is used to extract only the updated object out of the entire fetched data
     */
    protected mapUpdate(result: MutationResult<unknown>): Tupdate {
        const name = 'update' + upperCaseFirstLetter(this.name);
        return (result.data as any)[name]; // See https://github.com/apollographql/apollo-client/issues/5662
    }

    /**
     * This is used to extract only flag when deleting an object
     */
    protected mapDelete(result: MutationResult<unknown>): Tdelete {
        const name = 'delete' + makePlural(upperCaseFirstLetter(this.name));
        return (result.data as any)[name]; // See https://github.com/apollographql/apollo-client/issues/5662
    }

    /**
     * Returns additional variables to be used when getting a single object
     *
     * This is typically a site or state ID, and is needed to get appropriate access rights
     */
    protected getPartialVariablesForOne(): Observable<Partial<Vone>> {
        return of({});
    }

    /**
     * Returns additional variables to be used when getting multiple objects
     *
     * This is typically a site or state ID, but it could be something else to further filter the query
     */
    public getPartialVariablesForAll(): Observable<Partial<Vall>> {
        return of({});
    }

    /**
     * Returns additional variables to be used when creating an object
     *
     * This is typically a site or state ID
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected getPartialVariablesForCreation(object: Literal): Partial<Vcreate> {
        return {};
    }

    /**
     * Returns additional variables to be used when updating an object
     *
     * This is typically a site or state ID
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected getPartialVariablesForUpdate(object: Literal): Partial<Vupdate> {
        return {};
    }

    /**
     * Return additional variables to be used when deleting an object
     *
     * This is typically a site or state ID
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected getPartialVariablesForDelete(objects: Literal[]): Partial<Vdelete> {
        return {};
    }

    /**
     * Throw exception to prevent executing queries with invalid variables
     */
    protected throwIfObservable(value: unknown): void {
        if (value instanceof Observable) {
            throw new Error(
                'Cannot use Observable as variables. Instead you should use .subscribe() to call the method with a real value',
            );
        }
    }

    /**
     * Merge given ID with additional partial variables if there is any
     */
    private getVariablesForOne(id: string): Observable<Vone> {
        return this.getPartialVariablesForOne().pipe(
            map(partialVariables => merge({}, {id: id} as Vone, partialVariables)),
        );
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
