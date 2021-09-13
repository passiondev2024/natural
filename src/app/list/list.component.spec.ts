import {Location} from '@angular/common';
import {Injectable, NgZone} from '@angular/core';
import {ComponentFixture, fakeAsync, TestBed, tick, waitForAsync} from '@angular/core/testing';
import {HAMMER_LOADER} from '@angular/platform-browser';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {ActivatedRoute, Router, Routes} from '@angular/router';
import {RouterTestingModule} from '@angular/router/testing';
import {
    memorySessionStorageProvider,
    NaturalAlertModule,
    NaturalColumnsPickerModule,
    NaturalIconModule,
    NaturalPersistenceService,
    NaturalSearchModule,
    SortingOrder,
    toUrl,
} from '@ecodev/natural';
import {MockApolloProvider} from '../../../projects/natural/src/lib/testing/mock-apollo.provider';
import {MaterialModule} from '../material.module';
import {ListComponent} from './list.component';
import {
    NaturalStorage,
    SESSION_STORAGE,
} from '../../../projects/natural/src/lib/modules/common/services/memory-storage';

@Injectable()
class MockNaturalPersistenceService extends NaturalPersistenceService {
    public persistInUrl(key: string, value: unknown, route: ActivatedRoute): Promise<boolean> {
        // Nullify the redirection, it crashes in testing environment and it's not the point to be tested here
        return new Promise(() => true);
    }
}

const routes: Routes = [
    {
        path: 'my/home',
        children: [{path: 'list-a', component: ListComponent}],
    },
];

/**
 * Init storage by the official way for /list-a
 */
function intializeStorage(storage: NaturalStorage): void {
    const key = '/my/home;cat=123/list-a'; // Storage key is the entire url without params on last route
    const persistenceService = new NaturalPersistenceService({} as any, storage);
    persistenceService.persistInStorage(
        'ns',
        toUrl([
            [
                {
                    field: 'search',
                    condition: {like: {value: 'asdf'}},
                },
            ],
        ]),
        key,
    );
    persistenceService.persistInStorage('pa', {pageIndex: 1, pageSize: 300}, key);
    persistenceService.persistInStorage('so', [{field: 'name', order: SortingOrder.ASC}], key);
}

describe('Demo ListComponent', () => {
    let component: ListComponent;
    let fixture: ComponentFixture<ListComponent>;
    let ngZone: NgZone;

    let router: Router;
    let location: Location;
    let storage: NaturalStorage;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [ListComponent],
                imports: [
                    NoopAnimationsModule,
                    RouterTestingModule.withRoutes(routes),
                    MaterialModule,
                    NaturalAlertModule,
                    NaturalColumnsPickerModule,
                    NaturalIconModule.forRoot({}),
                    NaturalSearchModule,
                ],
                providers: [
                    MockApolloProvider,
                    {
                        provide: NaturalPersistenceService,
                        useClass: MockNaturalPersistenceService,
                    },
                    {
                        provide: HAMMER_LOADER,
                        useValue: () => new Promise(() => {}),
                    },
                    memorySessionStorageProvider,
                ],
            }).compileComponents();
        }),
    );

    beforeEach(fakeAsync(() => {
        fixture = TestBed.createComponent(ListComponent);
        component = fixture.componentInstance;
        ngZone = fixture.ngZone as NgZone;

        location = TestBed.inject(Location);
        router = TestBed.inject(Router);
        storage = TestBed.inject(SESSION_STORAGE);
        router.navigateByUrl(
            '/my/home;cat=123/list-a;dog=456;col="select,hidden,in-table-but-not-in-picker,does-not-exist"',
        );

        tick();
    }));

    it('should be created', () => {
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    it('should initialize with default variables', () => {
        fixture.detectChanges(); // init

        expect(component.variablesManager.variables.value)
            .withContext('after init')
            .toEqual({
                pagination: {offset: null, pageIndex: 0, pageSize: 5},
                sorting: [{field: 'name', order: SortingOrder.DESC}],
            });

        expect(component.selectedColumns).toEqual([]);
        expect(component.initialColumns).toBeUndefined();
    });

    it('should initialize with initial columns', fakeAsync(() => {
        // Before init
        component.initialColumns = ['name', 'description'];

        // Init
        fixture.detectChanges();
        expect(component.initialColumns).withContext('initial columns').toEqual(['name', 'description']);
        expect(component.selectedColumns).withContext('empty selected columns').toEqual([]);

        tick(1000); // to consider columns picker observable (selectionChange) call
        expect(component.selectedColumns).withContext('initialized selected columns').toEqual(['name', 'description']);
    }));

    xit('should retrieve columns from url', fakeAsync(() => {
        // Init
        fixture.detectChanges();
        tick(1000);
        const activatedRoute = TestBed.inject(ActivatedRoute);
        expect(component.persistSearch).withContext('with persistance').toBeTrue();
        expect(activatedRoute.snapshot.paramMap.get('col')).toEqual(
            'select,hidden,in-table-but-not-in-picker,does-not-exist',
        );
    }));

    it('should initialize with forced variables (no session storage)', () => {
        const variables = {
            filter: {groups: [{conditions: [{youpi: true}]}]},
            pagination: {pageIndex: 0, pageSize: 999},
            sorting: [{field: 'description', order: SortingOrder.DESC}],
        };

        const result = {
            filter: {groups: [{conditions: [{youpi: true}]}]},
            pagination: {pageIndex: 0, pageSize: 999},
            sorting: [{field: 'description', order: SortingOrder.DESC}],
        };

        // Before init
        component.initialColumns = ['name', 'description'];
        component.forcedVariables = variables;
        expect(component.variablesManager.variables.value)
            .withContext('variables before initialization')
            .toEqual(result);

        // Init
        // Pagination and sorting should default and pagination.offset is added
        const result2 = {
            filter: {groups: [{conditions: [{youpi: true}]}]},
            pagination: {offset: null, pageIndex: 0, pageSize: 999},
            sorting: [{field: 'description', order: SortingOrder.DESC}],
        };
        fixture.detectChanges();
        expect(component.variablesManager.variables.value)
            .withContext('variables after initialization')
            .toEqual(result2);
    });

    it('should initialize with predefined session storage', () => {
        intializeStorage(storage);

        // Init
        fixture.detectChanges();

        // The test
        const result = {
            filter: {groups: [{conditions: [{custom: {search: {value: 'asdf'}}}]}]},
            pagination: {offset: null, pageIndex: 1, pageSize: 300},
            sorting: [{field: 'name', order: SortingOrder.ASC}],
        };
        expect(component.variablesManager.variables.value)
            .withContext('variables after initialization')
            .toEqual(result);
    });

    it('should combine forced and persisted variables, giving priority to persisted ones', () => {
        intializeStorage(storage);

        const forcedVariables = {
            filter: {groups: [{conditions: [{custom: {search: {value: 'qwer'}}}]}]},
            pagination: {pageIndex: 0, pageSize: 999},
            sorting: [{field: 'description', order: SortingOrder.DESC}],
        };

        // Pagination and sorting are from those from storage, but filter combines forced and activated search
        const expectedResult = {
            filter: {
                groups: [
                    {
                        conditions: [{custom: {search: {value: 'qwer'}}}, {custom: {search: {value: 'asdf'}}}],
                    },
                ],
            },
            pagination: {offset: null, pageIndex: 1, pageSize: 300},
            sorting: [{field: 'name', order: SortingOrder.ASC}],
        };

        // Set forced variables
        component.forcedVariables = forcedVariables;

        // Init
        fixture.detectChanges();

        // The test
        expect(component.variablesManager.variables.value)
            .withContext('variables after initialization')
            .toEqual(expectedResult);
    });
});
