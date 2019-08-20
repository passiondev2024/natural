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
    Sorting,
    SortingOrder,
    toUrl,
} from '@ecodev/natural';
import { MockApolloProvider } from '../../../projects/natural/src/lib/testing/mock-apollo.provider';
import { MaterialModule } from '../material.module';
import { ListComponent } from './list.component';

class MockNaturalPersistenceService extends NaturalPersistenceService {

    public persistInUrl(key: string, value: any, route: ActivatedRoute) {
        // Nullify the redirection, it crashes in testing environment and it's not the point to be tested here
    }
}

const routes: Routes = [
    {path: '', redirectTo: 'root', pathMatch: 'full'},
    {
        path: 'my/home',
        children: [
            {path: 'list-a', component: ListComponent},
        ],
    },
];

describe('Demo ListComponent', () => {

    let component: ListComponent;
    let fixture: ComponentFixture<ListComponent>;
    let ngZone: NgZone;

    let router: Router;
    let location: Location;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                ListComponent,
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
        fixture = TestBed.createComponent(ListComponent);
        component = fixture.componentInstance;
        ngZone = fixture.ngZone as NgZone;

        location = TestBed.get(Location);
        router = TestBed.get(Router);
        ngZone.run(() => router.navigateByUrl('/my/home;cat=123/list-a;dog=456')); // both route levels have params
        tick();
    }));

    it('should be created', () => {
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    it('should initialize with default variables', () => {

        fixture.detectChanges(); // init

        expect(component.variablesManager.variables.value).toEqual({pagination: {pageIndex: 0, pageSize: 25}, sorting: null}, 'after init');
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
            sorting: [{field: 'description', order: SortingOrder.DESC} as Sorting],
        };

        // Before init
        component.contextColumns = ['name', 'description'];
        component.contextVariables = variables;
        expect(component.variablesManager.variables.value).toEqual(variables, 'variables before initialization');

        // Init
        fixture.detectChanges();
        expect(component.variablesManager.variables.value).toEqual(variables, 'variables after initialization');

    });

    it('should initialize with predefined session storage', () => {

        const storageVariables = {
            filter: {groups: [{conditions: [{custom: {search: {value: 'asdf'}}}]}]},
            pagination: {pageIndex: 1, pageSize: 300},
            sorting: [{field: 'name', order: SortingOrder.ASC} as Sorting],
        };

        const key = '/my/home;cat=123/list-a'; // Storage key is the entire url without params on last route

        // Init storage by the official way for /list-a
        const persistenceService = new NaturalPersistenceService({} as any);
        persistenceService.persistInStorage('ns', toUrl([[{field: 'search', condition: {like: {value: 'asdf'}}}]]), key);
        persistenceService.persistInStorage('pa', {pageIndex: 1, pageSize: 300}, key);
        persistenceService.persistInStorage('so', [{field: 'name', order: SortingOrder.ASC}], key);

        // Init
        fixture.detectChanges();

        // The test
        expect(component.variablesManager.variables.value).toEqual(storageVariables, 'variables after initialization');
    });

    it('should combine context and persisted variables, giving priority to persisted ones', () => {

        const contextVariables = {
            filter: {groups: [{conditions: [{custom: {search: {value: 'qwer'}}}]}]},
            pagination: {pageIndex: 0, pageSize: 999},
            sorting: [{field: 'description', order: SortingOrder.DESC} as Sorting],
        };

        const key = '/my/home;cat=123/list-a';

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
            pagination: {pageIndex: 1, pageSize: 300},
            sorting: [{field: 'name', order: SortingOrder.ASC} as Sorting],
        };

        // Set contextual variables
        component.contextVariables = contextVariables;

        // Init
        fixture.detectChanges();

        // The test
        expect(component.variablesManager.variables.value).toEqual(expectedResult, 'variables after initialization');
    });
});
