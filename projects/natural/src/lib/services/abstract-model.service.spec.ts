import {fakeAsync, TestBed, tick} from '@angular/core/testing';
import {NaturalAbstractModelService} from '@ecodev/natural';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {NaturalQueryVariablesManager} from '../classes/query-variable-manager';
import {MockApolloProvider, PostInput} from '../testing/mock-apollo.provider';
import {NotConfiguredService} from '../testing/not-configured.service';
import {PostService} from '../testing/post.service';
import {Literal} from '../types/types';
import {NullService} from '../testing/null.service';

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
            const expire = new Subject<void>();
            expectAnythingAndCompleteWithQVM(qvm => service.watchAll(qvm, expire), expire);
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
            const keysAfterCreation = Object.keys(object).length;

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
            const expire = new Subject<void>();
            expect(() => service.watchAll(qvm, expire).subscribe()).toThrowError(notConfiguredError);
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

    const getActual = () => {
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
    getObservable: (qvm: NaturalQueryVariablesManager) => Observable<any>,
    expire: Subject<void> | null = null,
): Observable<any> | null {
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
            next: v => {
                count++;
                actual = v;
            },
            complete: () => {
                completed = true;
            },
        });
    };

    getActual();

    tick(tickDelay);
    expect(count).toBe(1);
    expect(actual).toEqual(jasmine.anything());

    if (expire) {
        expect(completed).toBe(false);

        qvm.set('channel', {search: 'intermediate'});
        tick(tickDelay);

        expect(count).toBe(3, 'should get a cached response first, then final response from network');
        expect(actual).toEqual(jasmine.anything());
        expect(completed).toBe(false);

        qvm.set('channel', {search: 'final'});
        tick(tickDelay);

        expect(count).toBe(5, 'after the cached response, should get final response from network');
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

    return result;
}
