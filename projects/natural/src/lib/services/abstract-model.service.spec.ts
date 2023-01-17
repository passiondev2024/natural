import {fakeAsync, TestBed, tick} from '@angular/core/testing';
import {NaturalQueryVariablesManager} from '@ecodev/natural';
import {BehaviorSubject, Observable, of, throwError} from 'rxjs';
import {MockApolloProvider, PostInput} from '../testing/mock-apollo.provider';
import {NotConfiguredService} from '../testing/not-configured.service';
import {PostService} from '../testing/post.service';
import {Literal} from '../types/types';
import {NullService} from '../testing/null.service';
import {Apollo} from 'apollo-angular';
import {takeWhile} from 'rxjs/operators';

const observableError =
    'Cannot use Observable as variables. Instead you should use .subscribe() to call the method with a real value';
const notConfiguredError = 'GraphQL query for this method was not configured in this service constructor';

describe('NaturalAbstractModelService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [MockApolloProvider],
        });
    });

    describe('with PostService', () => {
        let service: PostService;
        beforeEach(() => {
            service = TestBed.inject(PostService);
        });

        it('should be created', () => {
            expect(service).toBeTruthy();
        });

        it('should resolve to model and optional enums', fakeAsync(() => {
            expectAnythingAndComplete(id => service.resolve(id), '123');
        }));

        it('should get one', fakeAsync(() => {
            expectAnythingAndComplete(vars => service.getOne(vars), '123');
        }));

        it('should not get one with observable', fakeAsync(() => {
            tick();
            expect(() => service.getOne(new BehaviorSubject('123') as any).subscribe()).toThrowError(observableError);
        }));

        it('should get all with query variables manager', fakeAsync(() => {
            expectAnythingAndCompleteWithQVM(qvm => service.getAll(qvm));
        }));

        it('should watch all with query variables manager', fakeAsync(() => {
            expectAnythingAndCompleteWithQVM(qvm => service.watchAll(qvm), true);
        }));

        it('should create', fakeAsync(() => {
            const object: PostInput = {
                slug: 'foo',
                blog: '123',
            };
            const result = expectAnythingAndComplete(vars => service.create(vars), object);

            let actual: any = null;
            result?.subscribe(v => (actual = v));
            tick(1000);

            // The input must have been mutated with whatever is coming from API
            expect(actual).toBe(object);

            // The result must be merged into the original object
            expect(Object.keys(object)).toContain('id');
            expect(Object.keys(object)).toContain('creationDate');
        }));

        it('should not create with observable', fakeAsync(() => {
            tick();
            expect(() => service.create(new BehaviorSubject({}) as any).subscribe()).toThrowError(observableError);
        }));

        it('should update with debounce', fakeAsync(() => {
            expectAnythingAndComplete(vars => service.update(vars), {id: 123});

            // A second call, after the debounce, should behave exactly the same way
            expectAnythingAndComplete(vars => service.update(vars), {id: 123});
        }));

        it('should complete two updates and share result', fakeAsync(() => {
            const object = {id: '123'};
            let update1Result: any = null;
            let update1Completed = false;
            let update2Result: any = null;
            let update2Completed = false;

            service.update(object).subscribe({
                next: v => (update1Result = v),
                complete: () => (update1Completed = true),
            });

            // Advance only half the debounce time, nothing happened yet
            tick(1000);
            expect(update1Completed).toBeFalse();
            expect(update1Result).toBeNull();

            service.update(object).subscribe({
                next: v => (update2Result = v),
                complete: () => (update2Completed = true),
            });

            // Advance over debounce time, everything is now done
            tick(5000);

            expect(update1Completed).toBeTrue();
            expect(update1Result).toEqual({
                id: '456',
                slug: 'test string',
                updateDate: 'test string',
                __typename: 'Post',
            });

            expect(update2Completed).toBeTrue();
            expect(update2Result).toEqual({
                id: '456',
                slug: 'test string',
                updateDate: 'test string',
                __typename: 'Post',
            });

            expect(update1Result).toBe(update2Result);
        }));

        it('should update immediately', fakeAsync(() => {
            expectAnythingAndComplete(vars => service.updateNow(vars), {id: 123});
        }));

        it('should not update with observable', fakeAsync(() => {
            tick();
            expect(() => service.update(new BehaviorSubject({id: 123}) as any).subscribe()).toThrowError(
                observableError,
            );
        }));

        it('should delete one object', fakeAsync(() => {
            expectAnythingAndComplete(vars => service.delete(vars), [{id: 123}]);
        }));

        it('should delete several objects at once', fakeAsync(() => {
            expectAnythingAndComplete(vars => service.delete(vars), [{id: 123}, {id: 456}]);
        }));

        it('should not delete with observable', fakeAsync(() => {
            tick();
            expect(() => service.delete(new BehaviorSubject({id: 123}) as any).subscribe()).toThrowError(
                observableError,
            );
        }));

        it('should cancel pending update of deleted object', fakeAsync(() => {
            let updateCompleted = false;
            let deleteResult = false;
            let deleteCompleted = false;

            service.update({id: '123'}).subscribe({
                next: () => {
                    throw new Error('should never be called, because update should be cancelled');
                },
                complete: () => (updateCompleted = true),
            });

            service.delete([{id: '123'}]).subscribe({
                next: () => {
                    deleteResult = true;
                },
                complete: () => (deleteCompleted = true),
            });

            tick(5000);

            expect(updateCompleted).toBeTrue();
            expect(deleteCompleted).toBeTrue();
            expect(deleteResult).toBeTrue();
        }));

        it('should not create or update with observable', fakeAsync(() => {
            tick();
            expect(() => service.createOrUpdate(new BehaviorSubject({id: 123}) as any).subscribe()).toThrowError(
                observableError,
            );
        }));

        it('should create or update', fakeAsync(() => {
            const object: PostInput & {id?: string} = {
                slug: 'foo',
                blog: '123',
            };

            // Create, should receive temporary id immediately
            const creation = service.createOrUpdate(object, true);
            creation.subscribe();

            // After create, should be usual object after creation
            tick();
            expect(object.id).toEqual('456');
            expect('updateDate' in object).toBeFalse();

            // Create or update again
            const update = service.createOrUpdate(object, true);
            expect('updateDate' in object).toBeFalse();
            update.subscribe();

            // should show created + updated objects merged
            tick();
            expect('updateDate' in object).toBeTrue();
        }));

        it('should wait for the first creation, then update the object', fakeAsync(() => {
            const object: PostInput & {id?: string} = {
                slug: 'foo',
                blog: '123',
            };

            let result: any = null;
            let repeatedResult: any = null;

            // Create, should be cached
            const creation = service.createOrUpdate(object, true);
            creation.subscribe(res => (result = res));

            // Repeated create should wait for the first creation, then update the object
            const repeatedCreation = service.createOrUpdate(object, true);
            repeatedCreation.subscribe(res => (repeatedResult = res));

            tick(5000);

            // After create, both result must be the exact same object (and not a clone)
            expect(result).not.toBeNull();
            expect(result.id).toEqual('456');
            expect('updateDate' in result).toBeTrue();
            expect(repeatedResult).not.toBeNull();
            expect(repeatedResult).toBe(result);

            // After create, object should be equivalent to result
            expect(object).toEqual(result);
        }));

        it('should count existing values', fakeAsync(() => {
            const qvm = new NaturalQueryVariablesManager<any>();
            const variables: any = {
                filter: {search: 'foo'},
            };
            qvm.set('variables', variables);

            let actual: any = null;
            service.count(qvm).subscribe(v => (actual = v));
            tick();
            expect(actual).toEqual(1);
        }));
    });

    describe('with NotConfiguredService', () => {
        let service: NotConfiguredService;
        beforeEach(() => {
            service = TestBed.inject(NotConfiguredService);
        });
        it('should throw instead of be created', () => {
            expect(service).toBeTruthy();
        });

        it('should throw instead of resolve to model and optional enums', fakeAsync(() => {
            expect(() => service.resolve('123').subscribe()).toThrowError(notConfiguredError);
        }));

        it('should throw instead of get one', fakeAsync(() => {
            expect(() => service.getOne('123').subscribe()).toThrowError(notConfiguredError);
        }));

        it('should throw instead of get all with query variables manager', fakeAsync(() => {
            const qvm = new NaturalQueryVariablesManager<any>();
            expect(() => service.getAll(qvm).subscribe()).toThrowError(notConfiguredError);
        }));

        it('should throw instead of watch all with query variables manager', fakeAsync(() => {
            const qvm = new NaturalQueryVariablesManager<any>();
            expect(() => service.watchAll(qvm).subscribe()).toThrowError(notConfiguredError);
        }));

        it('should throw instead of create', fakeAsync(() => {
            const object = {};
            expect(() => service.create(object).subscribe()).toThrowError(notConfiguredError);
        }));

        it('should throw instead of update immediately', fakeAsync(() => {
            expect(() => service.updateNow({id: 123}).subscribe()).toThrowError(notConfiguredError);
        }));

        it('should throw instead of delete one object', fakeAsync(() => {
            expect(() => service.delete([{id: '123'}]).subscribe()).toThrowError(notConfiguredError);
        }));

        it('should throw instead of create or update', fakeAsync(() => {
            expect(() => service.createOrUpdate({}).subscribe()).toThrowError(notConfiguredError);
        }));
    });

    describe('with NoResultService', () => {
        let service: NullService;
        beforeEach(() => {
            service = TestBed.inject(NullService);
        });

        it('should be created', () => {
            expect(service).toBeTruthy();
        });

        it('should create', fakeAsync(() => {
            const object: PostInput = {
                slug: 'foo',
                blog: '123',
            };
            const result = expectAnythingAndComplete(vars => service.create(vars), object, true);

            let actual: any = null;
            result?.subscribe(v => (actual = v));
            tick(1000);

            // The result must be null, because that's what the API returned and it must
            // be forward as is, so that the app can react accordingly
            expect(actual).toBeNull();

            // The input must not have been mutated at all
            expect(object).toEqual({
                slug: 'foo',
                blog: '123',
            });
        }));
    });
});

function expectAnythingAndComplete(
    getObservable: (variables: any) => Observable<any>,
    variables: string | Literal,
    expectNullResult = false,
): Observable<any> | null {
    let actual = null;
    let completed = false;
    let count = 0;
    let result: Observable<any> | null = null;

    const getActual = (): void => {
        result = getObservable(variables);
        result.subscribe({
            next: v => {
                count++;
                actual = v;
            },
            complete: () => {
                completed = true;
            },
        });
        tick(50000); // This should be longer that debounce in service.update
    };

    getActual();
    expect(count).toBe(1);
    expect(completed).toBe(true);
    if (expectNullResult) {
        expect(actual).toBeNull();
    } else {
        expect(actual).toEqual(jasmine.anything());
    }

    return result;
}

function expectAnythingAndCompleteWithQVM(
    getObservable: (qvm: NaturalQueryVariablesManager) => Observable<unknown>,
    doUnsubscribe = false,
): Observable<any> | null {
    let actual = null;
    let completed = false;
    let count = 0;
    const tickDelay = 20; // should match AbstractModel.watchAll debounceTime value
    const qvm = new NaturalQueryVariablesManager<any>();
    qvm.set('channel', {search: 'initial'});

    const result = getObservable(qvm);
    tick(tickDelay);
    const subscription = result.subscribe({
        next: v => {
            count++;
            actual = v;
        },
        complete: () => {
            completed = true;
        },
    });

    tick(tickDelay);
    expect(count).toBe(1);
    expect(actual).toEqual(jasmine.anything());

    if (doUnsubscribe) {
        expect(completed).toBe(false);

        qvm.set('channel', {search: 'intermediate'});
        tick(tickDelay);

        expect(count).withContext('should get a cached response first, then final response from network').toBe(3);
        expect(actual).toEqual(jasmine.anything());
        expect(completed).toBe(false);

        qvm.set('channel', {search: 'final'});
        tick(tickDelay);

        expect(count).withContext('after the cached response, should get final response from network').toBe(5);
        expect(actual).toEqual(jasmine.anything());
        expect(completed).toBe(false);

        subscription.unsubscribe();

        expect(count).withContext('no more result came').toBe(5);
        expect(actual).toEqual(jasmine.anything());
        expect(completed)
            .withContext(
                'should be still be not completed after unsubscribing, because Apollo has no subscribers anymore, but it correctly never completes, so do we',
            )
            .toBe(false);
    } else {
        expect(completed).toBe(true);
    }

    return result;
}

describe('NaturalAbstractModelService with failing Apollo should still keep watchAll observable alive', () => {
    it('should resolve to model and optional enums', fakeAsync(() => {
        let count = 0;
        let actual: any;
        let completed = false;

        TestBed.configureTestingModule({
            providers: [
                {
                    provide: Apollo,
                    useValue: {
                        watchQuery: () => {
                            const obs =
                                count === 2
                                    ? throwError(() => new Error('mock XHR failure'))
                                    : of({data: {posts: count}});

                            return {
                                valueChanges: obs,
                            };
                        },
                    },
                },
            ],
        });

        const service = TestBed.inject(PostService);
        const qvm = new NaturalQueryVariablesManager();
        service
            .watchAll(qvm)
            .pipe(takeWhile(v => (v as any) < 4))
            .subscribe({
                next: v => (actual = v),
                complete: () => (completed = true),
            });

        qvm.set('q', {filter: {v: ++count}});
        tick(1000);
        expect(actual).toBe(1);

        qvm.set('q', {filter: {v: ++count}});
        tick(1000);
        expect(actual).withContext('still 1 because XHR failed, so nothing was emitted').toBe(1);

        qvm.set('q', {filter: {v: ++count}});
        tick(1000);
        expect(actual).withContext('now 3 because observable is still alive and use next variables').toBe(3);
        expect(completed).toBeFalse();
    }));
});
