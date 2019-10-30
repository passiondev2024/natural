import { Location } from '@angular/common';
import { NgZone } from '@angular/core';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { HAMMER_LOADER } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router, Routes } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import {
    NaturalAlertModule,
    NaturalColumnsPickerModule,
    NaturalIconModule,
    NaturalPersistenceService,
    NaturalSearchModule,
    SortingOrder,
    toUrl,
} from '@ecodev/natural';
import { MockApolloProvider } from '../../../projects/natural/src/lib/testing/mock-apollo.provider';
import { MaterialModule } from '../material.module';
import { NavigableListComponent } from './navigable-list.component';

class MockNaturalPersistenceService extends NaturalPersistenceService {

    public persistInUrl(key: string, value: any, route: ActivatedRoute): Promise<boolean> {
        // Nullify the redirection, it crashes in testing environment and it's not the point to be tested here
        return new Promise(() => true);
    }
}

const routes: Routes = [
    {path: '', redirectTo: 'root', pathMatch: 'full'},
    {
        path: 'my/home',
        children: [
            {path: 'navigable-list-a', component: NavigableListComponent},
        ],
    },
];

describe('Demo NavigableListComponent', () => {

    let component: NavigableListComponent;
    let fixture: ComponentFixture<NavigableListComponent>;
    let ngZone: NgZone;

    let router: Router;
    let location: Location;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                NavigableListComponent,
            ],
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
                    useValue: () => new Promise(() => {
                    }),
                },
            ],
        }).compileComponents();
    }));

    beforeEach(fakeAsync(() => {
        sessionStorage.clear();
        fixture = TestBed.createComponent(NavigableListComponent);
        component = fixture.componentInstance;
        ngZone = fixture.ngZone as NgZone;

        location = TestBed.get(Location);
        router = TestBed.get(Router);
        ngZone.run(() => router.navigateByUrl('/my/home;cat=123/navigable-list-a;dog=456')); // both route levels have params
        tick();
    }));

    it('should be created', () => {
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    it('should initialize with default variables', () => {

        fixture.detectChanges(); // init

        expect(component.variablesManager.variables.value)
            .toEqual({
                pagination: {offset: null, pageIndex: 0, pageSize: 5},
                sorting: [{field: 'name', order: SortingOrder.DESC}, {field: 'id', order: SortingOrder.ASC}],
            }, 'after init');

        expect(component.selectedColumns).toEqual([]);
        expect(component.initialColumns).toBeUndefined();
    });

    it('should initialize with contextual columns', fakeAsync(() => {

        // Before init
        component.contextColumns = ['name', 'description'];

        // Init
        fixture.detectChanges();
        expect(component.initialColumns).toEqual(['name', 'description'], 'initial columns');
        expect(component.selectedColumns).toEqual([], 'empty selected columns');

        tick(); // to consider columns picker observable (selectionChange) call
        expect(component.selectedColumns).toEqual(['name', 'description'], 'initialized selected columns');

    }));

    it('should initialize with context variables (no session storage)', () => {

        const variables = {
            filter: {groups: [{conditions: [{youpi: true}]}]},
            pagination: {pageIndex: 0, pageSize: 999},
            sorting: [{field: 'description', order: SortingOrder.DESC}],
        };

        const result = {
            filter: {groups: [{conditions: [{youpi: true}]}]},
            pagination: {pageIndex: 0, pageSize: 999},
            sorting: [{field: 'description', order: SortingOrder.DESC}, {field: 'id', order: SortingOrder.ASC}],
        };

        // Before init
        component.contextColumns = ['name', 'description'];
        component.contextVariables = variables;
        expect(component.variablesManager.variables.value).toEqual(result, 'variables before initialization');

        // Init
        // Pagination and sorting should default and pagination.offset is added
        const result2 = {
            filter: {groups: [{conditions: [{youpi: true}]}]},
            pagination: {offset: null, pageIndex: 0, pageSize: 999},
            sorting: [{field: 'description', order: SortingOrder.DESC}, {field: 'id', order: SortingOrder.ASC}],
        };
        fixture.detectChanges();
        expect(component.variablesManager.variables.value).toEqual(result2, 'variables after initialization');

    });

    it('should initialize with predefined session storage', () => {

        const key = '/my/home;cat=123/navigable-list-a'; // Storage key is the entire url without params on last route

        // Init storage by the official way for /navigable-list-a
        const persistenceService = new NaturalPersistenceService({} as any);
        persistenceService.persistInStorage('ns', toUrl([[{field: 'search', condition: {like: {value: 'asdf'}}}]]), key);
        persistenceService.persistInStorage('pa', {pageIndex: 1, pageSize: 300}, key);
        persistenceService.persistInStorage('so', [{field: 'name', order: SortingOrder.ASC}], key);

        // Init
        fixture.detectChanges();

        // The test
        const result = {
            filter: {groups: [{conditions: [{custom: {search: {value: 'asdf'}}}]}]},
            pagination: {offset: null, pageIndex: 1, pageSize: 300},
            sorting: [{field: 'name', order: SortingOrder.ASC}, {field: 'id', order: SortingOrder.ASC}],
        };
        expect(component.variablesManager.variables.value).toEqual(result, 'variables after initialization');
    });

    it('should combine context and persisted variables, giving priority to persisted ones', () => {

        const contextVariables = {
            filter: {groups: [{conditions: [{custom: {search: {value: 'qwer'}}}]}]},
            pagination: {pageIndex: 0, pageSize: 999},
            sorting: [{field: 'description', order: SortingOrder.DESC}],
        };

        const key = '/my/home;cat=123/navigable-list-a';

        // Init storage by the official way
        const persistenceService = new NaturalPersistenceService({} as any);
        persistenceService.persistInStorage('ns', toUrl([[{field: 'search', condition: {like: {value: 'asdf'}}}]]), key);
        persistenceService.persistInStorage('pa', {pageIndex: 1, pageSize: 300}, key);
        persistenceService.persistInStorage('so', [{field: 'name', order: SortingOrder.ASC}], key);

        // Pagination and sorting are from those from storage, but filter combines context and activated search
        const expectedResult = {
            filter: {
                groups: [
                    {
                        conditions: [
                            {custom: {search: {value: 'qwer'}}},
                            {custom: {search: {value: 'asdf'}}},
                        ],
                    },
                ],
            },
            pagination: {offset: null, pageIndex: 1, pageSize: 300},
            sorting: [{field: 'name', order: SortingOrder.ASC}, {field: 'id', order: SortingOrder.ASC}],
        };

        // Set contextual variables
        component.contextVariables = contextVariables;

        // Init
        fixture.detectChanges();

        // The test
        expect(component.variablesManager.variables.value).toEqual(expectedResult, 'variables after initialization');
    });
});
