import {fakeAsync, TestBed, tick} from '@angular/core/testing';
import {NaturalAbstractModelService} from '@ecodev/natural';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {NaturalQueryVariablesManager} from '../classes/query-variable-manager';
import {MockApolloProvider} from '../testing/mock-apollo.provider';
import {NotConfiguredService} from '../testing/not-configured.service';
import {PostService} from '../testing/post.service';
import {Literal} from '../types/types';

const observableError =
    'Cannot use Observable as variables. Instead you should use .subscribe() to call the method with a real value';
const notConfiguredError = 'GraphQL query for this method was not configured in this service constructor';

describe('NaturalAbstractModelService', () => {
    let service: PostService | NotConfiguredService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [MockApolloProvider],
        });
    });

    describe('with PostService', () => {
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
            const object = {
                slug: 'foo',
                blog: '123',
            };
            const result = expectAnythingAndComplete(vars => service.create(vars), object);

            // if the query is configured, then the result must be merged into the original object
            if (result) {
                let actual = null;
                result.subscribe(v => (actual = v));
                expect(Object.keys(object).length).toBeGreaterThan(0);
            }
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
            const object: Literal = {
                slug: 'foo',
                blog: '123',
            };

            // Create, should receive temporary id immediately
            const creation = service.createOrUpdate(object, true);
            expect(object.creatingId).toBe(2);
            creation.subscribe();

            // After create, should be usual object after creation
            tick();
            expect(object.creatingId).toBeUndefined();
            expect(object.id).toEqual('456');
            const keysAfterCreation = Object.keys(object).length;

            // Create or update again
            const update = service.createOrUpdate(object, true);
            expect(Object.keys(object).length).toBe(keysAfterCreation); // not yet updated
            update.subscribe();

            tick();
            expect(Object.keys(object).length).toBeGreaterThan(keysAfterCreation); // should show created + updated objects merged
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
});

function expectAnythingAndComplete(
    getObservable: (variables: any) => Observable<any>,
    variables: string | Literal,
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
    expect(actual).toEqual(jasmine.anything());

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
