import {TestBed} from '@angular/core/testing';
import {NaturalSelectComponent} from '@ecodev/natural';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {Component} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MockApolloProvider} from '../../../testing/mock-apollo.provider';
import {
    AbstractTestHostWithFormControlComponent,
    AbstractTestHostWithNgModelComponent,
    TestFixture,
    testSelectAndSelectHierarchicCommonBehavior,
} from '../testing/utils';
import {By} from '@angular/platform-browser';
import {ItemService} from '../../../testing/item.service';

@Component({
    template: `
        <natural-select
            [service]="service"
            [required]="required"
            [disabled]="disabled"
            (selectionChange)="onSelection($event)"
            (blur)="onBlur()"
            [(ngModel)]="myValue"
            placeholder="ngModel"
            i18n-placeholder
        />
    `,
    standalone: true,
    imports: [FormsModule, NaturalSelectComponent],
})
class TestHostWithServiceAndNgModelComponent extends AbstractTestHostWithNgModelComponent {}

@Component({
    template: `
        <natural-select
            [service]="service"
            (selectionChange)="onSelection($event)"
            (blur)="onBlur()"
            [formControl]="formControl"
            placeholder="formControl"
            i18n-placeholder
        />
    `,
    standalone: true,
    imports: [ReactiveFormsModule, NaturalSelectComponent],
})
class TestHostWithServiceAndFormControlComponent extends AbstractTestHostWithFormControlComponent {}

describe('NaturalSelectComponent', () => {
    const data: TestFixture<NaturalSelectComponent<ItemService>> = {
        hostComponent: null as any,
        selectComponent: null as any,
        fixture: null as any,
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [NoopAnimationsModule],
            providers: [MockApolloProvider],
        }).compileComponents();
    });

    describe('with ngModel', () => {
        beforeEach(() => {
            data.fixture = TestBed.createComponent(TestHostWithServiceAndNgModelComponent);
            data.hostComponent = data.fixture.componentInstance;
            data.selectComponent = data.fixture.debugElement.query(By.directive(NaturalSelectComponent)).context;
            data.fixture.detectChanges();
        });

        testSelectComponent(data);
    });

    describe('with formControl', () => {
        beforeEach(() => {
            data.fixture = TestBed.createComponent(TestHostWithServiceAndFormControlComponent);
            data.hostComponent = data.fixture.componentInstance;
            data.selectComponent = data.fixture.debugElement.query(By.directive(NaturalSelectComponent)).context;
            data.fixture.detectChanges();
        });

        testSelectComponent(data);
    });
});

function testSelectComponent(data: TestFixture<NaturalSelectComponent<ItemService>>): void {
    testSelectAndSelectHierarchicCommonBehavior(data);

    it('search variables are correct', () => {
        expect(data.selectComponent.getVariablesForDebug()).toEqual({
            filter: {groups: [{conditions: [{custom: null}]}]},
            pagination: {
                pageIndex: 0,
                pageSize: 10,
            },
        });

        // Can search with default `custom.search`
        data.selectComponent.search('foo');
        expect(data.selectComponent.getVariablesForDebug()).toEqual({
            filter: {groups: [{conditions: [{custom: {search: {value: 'foo'}}}]}]},
            pagination: {
                pageIndex: 0,
                pageSize: 10,
            },
        });

        // Can cancel previous search
        data.selectComponent.search('');
        expect(data.selectComponent.getVariablesForDebug()).toEqual({
            filter: {groups: [{conditions: [{custom: null}]}]},
            pagination: {
                pageIndex: 0,
                pageSize: 10,
            },
        });

        // Can search on specified field `name` and will default to `like` operator
        data.selectComponent.searchField = 'name';
        data.selectComponent.search('foo');
        expect(data.selectComponent.getVariablesForDebug()).toEqual({
            filter: {groups: [{conditions: [{name: {like: {value: '%foo%'}}}]}]},
            pagination: {
                pageIndex: 0,
                pageSize: 10,
            },
        });

        // Can cancel previous search
        data.selectComponent.search('');
        expect(data.selectComponent.getVariablesForDebug()).toEqual({
            filter: {groups: [{conditions: [{name: null}]}]},
            pagination: {
                pageIndex: 0,
                pageSize: 10,
            },
        });

        // Can search on default field `custom` with specified `like` operator
        data.selectComponent.searchField = 'custom';
        data.selectComponent.searchOperator = 'like';
        data.selectComponent.search('foo');
        expect(data.selectComponent.getVariablesForDebug()).toEqual({
            filter: {groups: [{conditions: [{custom: {like: {value: '%foo%'}}}]}]},
            pagination: {
                pageIndex: 0,
                pageSize: 10,
            },
        });

        // Can cancel previous search
        data.selectComponent.search('');
        expect(data.selectComponent.getVariablesForDebug()).toEqual({
            filter: {groups: [{conditions: [{custom: null}]}]},
            pagination: {
                pageIndex: 0,
                pageSize: 10,
            },
        });

        // Can search on specific `myField.myOperator`
        data.selectComponent.searchField = 'myField';
        data.selectComponent.searchOperator = 'myOperator';
        data.selectComponent.search('foo');
        expect(data.selectComponent.getVariablesForDebug()).toEqual({
            filter: {groups: [{conditions: [{myField: {myOperator: {value: 'foo'}}}]}]},
            pagination: {
                pageIndex: 0,
                pageSize: 10,
            },
        });
    });
}
