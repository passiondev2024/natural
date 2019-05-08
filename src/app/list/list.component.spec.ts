import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
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

describe('ListComponent', () => {
    let component: ListComponent;
    let fixture: ComponentFixture<ListComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                ListComponent,
            ],
            imports: [
                NoopAnimationsModule,
                RouterTestingModule,
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
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        sessionStorage.clear();
        fixture = TestBed.createComponent(ListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize with default variables', () => {

        fixture = TestBed.createComponent(ListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges(); // init

        expect(component.variablesManager.variables.value).toEqual({pagination: {pageIndex: 0, pageSize: 25}, sorting: null}, 'after init');
        expect(component.selectedColumns).toEqual([]);
        expect(component.initialColumns).toBeUndefined();
    });

    it('should initialize with contextual columns', () => {

        fixture = TestBed.createComponent(ListComponent);
        component = fixture.componentInstance;

        // Before init
        component.contextColumns = ['name', 'tralala'];

        // Init
        fixture.detectChanges();
        expect(component.initialColumns).toEqual(['name', 'tralala'], 'initial columns');
        expect(component.selectedColumns).toEqual([], 'empty selected columns');

        // TODO : make it work, detection has to be done after columns-picker calls it's selectionChange event.
        // fixture.detectChanges();
        // expect(component.selectedColumns).toEqual(['name', 'tralala'], 'initialized selected columns');

    });

    it('should initialize with context variables (no session storage)', () => {

        fixture = TestBed.createComponent(ListComponent);
        component = fixture.componentInstance;

        const variables = {
            filter: {youpi: true},
            pagination: {pageIndex: 0, pageSize: 9999},
            sorting: [{field: 'tralala', order: SortingOrder.DESC} as Sorting],
        };

        // Before init
        component.contextColumns = ['name', 'tralala'];
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

        // Init storage by the official way
        const persistenceService = new NaturalPersistenceService({} as any);
        persistenceService.persistInStorage('ns', toUrl([[{field: 'search', condition: {like: {value: 'asdf'}}}]]), 'list-something');
        persistenceService.persistInStorage('pa', {pageIndex: 1, pageSize: 300}, 'list-something');
        persistenceService.persistInStorage('so', [{field: 'name', order: SortingOrder.ASC}], 'list-something');

        // Init
        fixture = TestBed.createComponent(ListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        // The test
        expect(component.variablesManager.variables.value).toEqual(storageVariables, 'variables after initialization');
    });

    it('should combine context and persisted variables, giving priority to persisted ones', () => {

        const contextVariables = {
            filter: {groups: [{conditions: [{custom: {search: {value: 'qwer'}}}]}]},
            pagination: {pageIndex: 0, pageSize: 9999},
            sorting: [{field: 'tralala', order: SortingOrder.DESC} as Sorting],
        };

        // Init storage by the official way
        const persistenceService = new NaturalPersistenceService({} as any);
        persistenceService.persistInStorage('ns', toUrl([[{field: 'search', condition: {like: {value: 'asdf'}}}]]), 'list-something');
        persistenceService.persistInStorage('pa', {pageIndex: 1, pageSize: 300}, 'list-something');
        persistenceService.persistInStorage('so', [{field: 'name', order: SortingOrder.ASC}], 'list-something');

        // Pagination and sorting are from those from storage, but filter combines context and activated search
        const expectedResult = {
            filter: {
                groups: [
                    {
                        conditions: [
                            {custom: {search: {value: 'asdf'}}},
                            {custom: {search: {value: 'qwer'}}},
                        ],
                    },
                ],
            },
            pagination: {pageIndex: 1, pageSize: 300},
            sorting: [{field: 'name', order: SortingOrder.ASC} as Sorting],
        };

        // Create component
        fixture = TestBed.createComponent(ListComponent);
        component = fixture.componentInstance;

        // Set contextual variables
        component.contextVariables = contextVariables;

        // Init
        fixture.detectChanges();

        // The test
        expect(component.variablesManager.variables.value).toEqual(expectedResult, 'variables after initialization');
    });
});
