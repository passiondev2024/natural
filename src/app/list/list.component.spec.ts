import {Injectable, NgZone} from '@angular/core';
import {ComponentFixture, fakeAsync, flush, TestBed, tick} from '@angular/core/testing';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {Router, Routes} from '@angular/router';
import {RouterTestingModule} from '@angular/router/testing';
import {
    memorySessionStorageProvider,
    NaturalPersistenceService,
    naturalProviders,
    SortingOrder,
    toUrl,
} from '@ecodev/natural';
import {MockApolloProvider} from '../../../projects/natural/src/lib/testing/mock-apollo.provider';
import {ListComponent} from './list.component';

@Injectable({providedIn: 'root'})
class MockNaturalPersistenceService extends NaturalPersistenceService {
    public override persistInUrl(): Promise<boolean> {
        // Nullify the redirection, it crashes in testing environment and it's not the point to be tested here
        return new Promise(() => true);
    }
}

const routes: Routes = [
    {path: '', redirectTo: 'root', pathMatch: 'full'},
    {
        path: 'my/home',
        children: [{path: 'list-a', component: ListComponent}],
    },
];

/**
 * Init storage by the official way for /list-a
 */
function initializeStorage(persistenceService: NaturalPersistenceService): void {
    const key = '/my/home;cat=123/list-a'; // Storage key is the entire url without params on last route
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

    let router: Router;
    let persistenceService: NaturalPersistenceService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [NoopAnimationsModule, RouterTestingModule.withRoutes(routes)],
            providers: [
                naturalProviders,
                MockApolloProvider,
                {
                    provide: NaturalPersistenceService,
                    useClass: MockNaturalPersistenceService,
                },
                memorySessionStorageProvider,
            ],
        }).compileComponents();
    });

    // eslint-disable-next-line @typescript-eslint/require-await
    beforeEach(async () => {
        fixture = TestBed.createComponent(ListComponent);
        component = fixture.componentInstance;

        router = TestBed.inject(Router);
        persistenceService = TestBed.inject(NaturalPersistenceService);
        router.navigateByUrl('/my/home;cat=123/list-a;dog=456');
    });

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

        expect(component.columnsForTable).toEqual([]);
        expect(component.selectedColumns).toBeUndefined();
    });

    it('should initialize with initial columns', fakeAsync(() => {
        // Before init
        component.selectedColumns = ['name', 'description'];

        // Init
        fixture.detectChanges();
        expect(component.selectedColumns).withContext('initial columns').toEqual(['name', 'description']);
        expect(component.columnsForTable).withContext('empty selected columns').toEqual([]);

        tick(1000); // to consider columns picker observable (selectionChange) call
        expect(component.columnsForTable).withContext('initialized selected columns').toEqual(['name', 'description']);

        flush();
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
        component.selectedColumns = ['name', 'description'];
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
        initializeStorage(persistenceService);

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
        initializeStorage(persistenceService);

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
