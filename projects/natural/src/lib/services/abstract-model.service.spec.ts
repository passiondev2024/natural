import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { fakeAsync, inject, tick } from '@angular/core/testing';
import { NaturalAbstractModelService } from './abstract-model.service';
import { NaturalQueryVariablesManager } from '../classes/query-variable-manager';
import { Literal } from '../types/types';

// A shortcut for shorter lines
type ModelService = NaturalAbstractModelService<any, any, any, any, any, any, any, any, any>;

export abstract class AbstractModelServiceSpec {

    private static readonly notConfiguredMessage = 'GraphQL query for this method was not configured in this service constructor';

    /**
     * Test all common methods defined on AbstractModelService
     */
    public static test(serviceClass,
                       expectedOne: boolean = true,
                       expectedAll: boolean = true,
                       expectedResolve: boolean = true,
                       expectedCreate: boolean = true,
                       expectedUpdate: boolean = true,
                       expectedDelete: boolean = true): void {

        const error = 'Cannot use Observable as variables. Instead you should use .subscribe() to call the method with a real value';

        it('should be created', inject([serviceClass], (service: ModelService) => {
            expect(service).toBeTruthy();
        }));

        it('should get one',
            fakeAsync(inject([serviceClass], (service: ModelService) => {
                this.expectNotConfiguredOrEqual(expectedOne, (vars) => service.getOne(vars), '123');
            })),
        );

        it('should not get one with observable',
            fakeAsync(inject([serviceClass], (service: ModelService) => {
                tick();
                expect(() => service.getOne(new BehaviorSubject('123') as any).subscribe()).toThrowError(error);
            })),
        );

        it('should get all with query variables manager',
            fakeAsync(inject([serviceClass], (service: ModelService) => {
                this.expectNotConfiguredOrEqualForQueryVariablesManager(
                    expectedAll,
                    (qvm) => service.getAll(qvm),
                );
            })),
        );

        it('should watch all with query variables manager',
            fakeAsync(inject([serviceClass], (service: ModelService) => {
                const expire = new Subject<void>();
                this.expectNotConfiguredOrEqualForQueryVariablesManager(
                    expectedAll,
                    (qvm) => service.watchAll(qvm, expire),
                    expire,
                );
            })),
        );

        it('should create',
            fakeAsync(inject([serviceClass], (service: ModelService) => {
                const object = {};
                const result = this.expectNotConfiguredOrEqual(expectedCreate, (vars) => service.create(vars), object);

                // if the query is configured, then the result must be merged into the original object
                if (result) {
                    let actual = null;
                    result.subscribe(v => actual = v);
                    expect(Object.keys(object).length).toBeGreaterThan(0);
                }
            })),
        );

        it('should not create with observable',
            fakeAsync(inject([serviceClass], (service: ModelService) => {
                tick();
                expect(() => service.create(new BehaviorSubject({}) as any).subscribe()).toThrowError(error);
            })),
        );

        it('should update immediately', fakeAsync(inject([serviceClass], (service: ModelService) => {
                this.expectNotConfiguredOrEqual(expectedUpdate, (vars) => service.updateNow(vars), {id: 123});
            })),
        );

        it('should not update with observable',
            fakeAsync(inject([serviceClass], (service: ModelService) => {
                tick();
                expect(() => service.update(new BehaviorSubject({id: 123}) as any).subscribe()).toThrowError(error);
            })),
        );

        it('should delete one object',
            fakeAsync(inject([serviceClass], (service: ModelService) => {
                this.expectNotConfiguredOrEqual(expectedDelete, (vars) => service.delete(vars), {id: 123});
            })),
        );

        it('should delete several objects at once',
            fakeAsync(inject([serviceClass], (service: ModelService) => {
                this.expectNotConfiguredOrEqual(expectedDelete, (vars) => service.delete(vars), [{id: 123}, {id: 456}]);
            })),
        );

        it('should not delete with observable',
            fakeAsync(inject([serviceClass], (service: ModelService) => {
                tick();
                expect(() => service.delete(new BehaviorSubject({id: 123}) as any).subscribe()).toThrowError(error);
            })),
        );

        it('should not create or update with observable',
            fakeAsync(inject([serviceClass], (service: ModelService) => {
                tick();
                expect(() => service.createOrUpdate(new BehaviorSubject({id: 123}) as any).subscribe()).toThrowError(error);
            })),
        );

        it('should create or update',
            fakeAsync(inject([serviceClass], (service: ModelService) => {

                if (!expectedCreate || !expectedUpdate) {
                    expect(() => service.createOrUpdate({}).subscribe()).toThrowError(this.notConfiguredMessage);
                    return;
                }

                const object: Literal = {};

                // Create, should receive temporary id immediately
                service.createOrUpdate(object, true).subscribe();
                expect(object).toEqual({creatingId: 2});

                // After create, should be usual object after creation
                tick();
                expect(object.creatingId).toBeUndefined();
                expect(object.id).toEqual('456');
                const keysAfterCreation = Object.keys(object).length;

                // Create or update again
                service.createOrUpdate(object, true).subscribe();
                expect(Object.keys(object).length).toBe(keysAfterCreation); // not yet updated

                tick();
                expect(Object.keys(object).length).toBeGreaterThan(keysAfterCreation); // should show created + updated objects merged
            })),
        );
    }

    private static expectNotConfiguredOrEqual(expectSuccess: boolean,
                                              getObservable: (variables: string | Literal) => Observable<any>,
                                              variables: string | Literal): Observable<any> | null {
        let actual = null;
        let completed = false;
        let count = 0;
        let result: Observable<any> | null = null;

        const getActual = () => {
            result = getObservable(variables);
            result.subscribe({
                next: (v) => {
                    count++;
                    actual = v;
                },
                complete: () => {
                    completed = true;
                },
            });
            tick();
        };

        if (expectSuccess) {
            getActual();
            expect(count).toBe(1);
            expect(completed).toBe(true);
            expect(actual).toEqual(jasmine.anything());
        } else {
            expect(getActual).toThrowError(this.notConfiguredMessage);
        }

        return result;
    }

    private static expectNotConfiguredOrEqualForQueryVariablesManager(expectSuccess: boolean,
                                                                      getObservable: (qvm: NaturalQueryVariablesManager) => Observable<any>,
                                                                      expire: Subject<void> | null = null): Observable<any> | null {
        let actual = null;
        let completed = false;
        let count = 0;
        let result: Observable<any> | null = null;
        const tickDelay = 20; // should match AbstractModel.watchAll debounceTime value
        const qvm = new NaturalQueryVariablesManager<any>();
        qvm.set('channel', {search: 'initial'});

        const getActual = () => {
            result = getObservable(qvm);
            tick(tickDelay);
            result.subscribe({
                next: (v) => {
                    count++;
                    actual = v;
                },
                complete: () => {
                    completed = true;
                },
            });
        };

        if (expectSuccess) {
            getActual();

            tick(tickDelay);
            expect(count).toBe(1);
            expect(actual).toEqual(jasmine.anything());

            if (expire) {
                expect(completed).toBe(false);

                qvm.set('channel', {search: 'intermediate'});
                tick(tickDelay);

                expect(count).toBe(3, 'Must be 3 because we got a cached response first, then final response from network');
                expect(actual).toEqual(jasmine.anything());
                expect(completed).toBe(false);

                qvm.set('channel', {search: 'final'});
                tick(tickDelay);

                expect(count).toBe(5, 'Must be 5 because we got a cached response first, then final response from network');
                expect(actual).toEqual(jasmine.anything());
                expect(completed).toBe(false);

                expire.next();

                expect(count).toBe(5, 'no more result came');
                expect(actual).toEqual(jasmine.anything());
                expect(completed).toBe(true, 'should be completed after calling expire');
                expect(expire.observers.length).toBe(0, 'expire should not be observed anymore');
            } else {
                expect(completed).toBe(true);
            }

        } else {
            expect(getActual).toThrowError(this.notConfiguredMessage);
        }

        return result;
    }
}
