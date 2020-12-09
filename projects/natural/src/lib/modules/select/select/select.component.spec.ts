// tslint:disable:directive-class-suffix
import {waitForAsync, TestBed} from '@angular/core/testing';
import {
    NaturalHierarchicSelectorModule,
    NaturalIconModule,
    NaturalSelectComponent,
    NaturalSelectModule,
} from '@ecodev/natural';
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
        ></natural-select>
    `,
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
        ></natural-select>
    `,
})
class TestHostWithServiceAndFormControlComponent extends AbstractTestHostWithFormControlComponent {}

describe('NaturalSelectComponent', () => {
    const data: TestFixture<NaturalSelectComponent> = {
        hostComponent: null as any,
        selectComponent: null as any,
        fixture: null as any,
    };

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [
                    NoopAnimationsModule,
                    FormsModule,
                    ReactiveFormsModule,
                    NaturalSelectModule,
                    NaturalHierarchicSelectorModule,
                    NaturalIconModule.forRoot({}),
                ],
                declarations: [TestHostWithServiceAndNgModelComponent, TestHostWithServiceAndFormControlComponent],
                providers: [MockApolloProvider],
            }).compileComponents();
        }),
    );

    describe('with ngModel', () => {
        beforeEach(() => {
            data.fixture = TestBed.createComponent(TestHostWithServiceAndNgModelComponent);
            data.hostComponent = data.fixture.componentInstance;
            data.selectComponent = data.fixture.debugElement.query(By.directive(NaturalSelectComponent)).context;
            data.fixture.detectChanges();
        });

        testSelectAndSelectHierarchicCommonBehavior(data);
    });

    describe('with formControl', () => {
        beforeEach(() => {
            data.fixture = TestBed.createComponent(TestHostWithServiceAndFormControlComponent);
            data.hostComponent = data.fixture.componentInstance;
            data.selectComponent = data.fixture.debugElement.query(By.directive(NaturalSelectComponent)).context;
            data.fixture.detectChanges();
        });

        testSelectAndSelectHierarchicCommonBehavior(data);
    });
});
