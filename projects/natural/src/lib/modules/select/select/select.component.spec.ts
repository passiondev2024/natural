// tslint:disable:directive-class-suffix
import {async, TestBed} from '@angular/core/testing';
import {
    NaturalHierarchicSelectorModule,
    NaturalIconModule,
    NaturalSelectComponent,
    NaturalSelectHierarchicComponent,
    NaturalSelectModule,
} from '@ecodev/natural';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {Component} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MockApolloProvider} from '../../../testing/mock-apollo.provider';
import {
    TestFixture,
    TestHostWithFormControlComponent,
    TestHostWithNgModelComponent,
    testOneComponent,
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
class TestHostWithServiceAndNgModelComponent extends TestHostWithNgModelComponent {}

@Component({
    template: `
        <natural-select
            [service]="service"
            [required]="required"
            (selectionChange)="onSelection($event)"
            (blur)="onBlur()"
            [formControl]="formControl"
            placeholder="formControl"
        ></natural-select>
    `,
})
class TestHostWithServiceAndFormControlComponent extends TestHostWithFormControlComponent {}

describe('NaturalSelectComponent', () => {
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
            declarations: [TestHostWithServiceAndNgModelComponent, TestHostWithServiceAndFormControlComponent],
            providers: [MockApolloProvider],
        }).compileComponents();
    }));

    describe('with ngModel', () => {
        beforeEach(() => {
            data.fixture = TestBed.createComponent(TestHostWithServiceAndNgModelComponent);
            data.hostComponent = data.fixture.componentInstance;
            data.selectComponent = data.fixture.debugElement.query(By.directive(NaturalSelectComponent)).context;
            data.fixture.detectChanges();
        });

        testOneComponent(data);
    });

    describe('with formControl', () => {
        beforeEach(() => {
            data.fixture = TestBed.createComponent(TestHostWithServiceAndFormControlComponent);
            data.hostComponent = data.fixture.componentInstance;
            data.selectComponent = data.fixture.debugElement.query(By.directive(NaturalSelectComponent)).context;
            data.fixture.detectChanges();
        });

        testOneComponent(data);
    });
});
