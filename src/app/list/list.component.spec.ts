import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { NaturalAlertModule, NaturalColumnsPickerModule, NaturalIconModule, NaturalSearchModule } from '@ecodev/natural';
import { MockApolloProvider } from '../../../projects/natural/src/lib/testing/mock-apollo.provider';
import { MaterialModule } from '../material.module';

import { ListComponent } from './list.component';

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
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
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

        const variables = {pagination: {pageIndex: 0, pageSize: 25}, sorting: null};
        expect(component.variablesManager.variables.value).toEqual(variables);
        expect(component.selectedColumns).toEqual([]);
        expect(component.initialColumns).toBeUndefined();
    });

    it('should initialize width context variables', () => {

        fixture = TestBed.createComponent(ListComponent);
        component = fixture.componentInstance;

        // Before init
        component.contextColumns = ['name', 'tralala'];
        component.contextVariables = {filter: {youpi: true}}; // TODO : init with sorting and pagination, that is actually ignored

        // Init
        fixture.detectChanges();

        const variables = {filter: {youpi: true}, pagination: {pageIndex: 0, pageSize: 25}, sorting: null};
        expect(component.variablesManager.variables.value).toEqual(variables);
        expect(component.initialColumns).toEqual(['name', 'tralala'], 'initial columns');
        expect(component.selectedColumns).toEqual([], 'empty selected columns');

        // TODO : make it work, detection has to be done after columns-picker calls it's (selectionChange) event.
        // fixture.detectChanges();
        // expect(component.selectedColumns).toEqual(['name', 'tralala'], 'initialized selected columns');

    });
});
