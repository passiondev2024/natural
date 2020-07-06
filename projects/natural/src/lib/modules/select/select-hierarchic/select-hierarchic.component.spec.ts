// tslint:disable:directive-class-suffix
import {async, TestBed} from '@angular/core/testing';
import {
    NaturalHierarchicSelectorModule,
    NaturalIconModule,
    NaturalSelectHierarchicComponent,
    NaturalSelectModule,
} from '@ecodev/natural';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {Component} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MockApolloProvider} from '../../../testing/mock-apollo.provider';
import {
    TestFixture,
    AbstractTestHostWithFormControlComponent,
    AbstractTestHostWithNgModelComponent,
    testSelectAndSelectHierarchicCommonBehavior,
} from '../testing/utils';
import {By} from '@angular/platform-browser';

@Component({
    template: `
        <natural-select-hierarchic
            [config]="hierarchicConfig"
            [required]="required"
            [disabled]="disabled"
            (selectionChange)="onSelection($event)"
            (blur)="onBlur()"
            [(ngModel)]="myValue"
            placeholder="ngModel"
        ></natural-select-hierarchic>
    `,
})
class TestHostWithHierarchicAndNgModelComponent extends AbstractTestHostWithNgModelComponent {}

@Component({
    template: `
        <natural-select-hierarchic
            [config]="hierarchicConfig"
            (selectionChange)="onSelection($event)"
            (blur)="onBlur()"
            [formControl]="formControl"
            placeholder="formControl"
        ></natural-select-hierarchic>
    `,
})
class TestHostWithHierarchicAndFormControlComponent extends AbstractTestHostWithFormControlComponent {}

describe('NaturalSelectHierarchicComponent', () => {
    const data: TestFixture = {
        hostComponent: null as any,
        selectComponent: null as any,
        fixture: null as any,
    };

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                FormsModule,
                ReactiveFormsModule,
                NaturalSelectModule,
                NaturalHierarchicSelectorModule,
                NaturalIconModule.forRoot({}),
            ],
            declarations: [TestHostWithHierarchicAndNgModelComponent, TestHostWithHierarchicAndFormControlComponent],
            providers: [MockApolloProvider],
        }).compileComponents();
    }));

    describe('with ngModel', () => {
        beforeEach(() => {
            data.fixture = TestBed.createComponent(TestHostWithHierarchicAndNgModelComponent);
            data.hostComponent = data.fixture.componentInstance;
            data.selectComponent = data.fixture.debugElement.query(
                By.directive(NaturalSelectHierarchicComponent),
            ).context;
            data.fixture.detectChanges();
        });

        testSelectAndSelectHierarchicCommonBehavior(data);
    });

    describe('with formControl', () => {
        beforeEach(() => {
            data.fixture = TestBed.createComponent(TestHostWithHierarchicAndFormControlComponent);
            data.hostComponent = data.fixture.componentInstance;
            data.selectComponent = data.fixture.debugElement.query(
                By.directive(NaturalSelectHierarchicComponent),
            ).context;
            data.fixture.detectChanges();
        });

        testSelectAndSelectHierarchicCommonBehavior(data);
    });
});
