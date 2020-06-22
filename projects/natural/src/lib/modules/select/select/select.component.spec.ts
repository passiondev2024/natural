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
    getInput,
    hasMatError,
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

        it(`should show error if required and blurred`, () => {
            expect(hasMatError(data)).toBeFalse();

            data.hostComponent.required = true;

            // Should not have error yet because not touched
            data.fixture.detectChanges();
            expect(hasMatError(data)).toBeFalse();

            const input = getInput(data);

            // Touch the element
            input.dispatchEvent(new Event('focus'));
            input.dispatchEvent(new Event('blur'));

            // Now should have error
            data.fixture.detectChanges();
            expect(hasMatError(data)).toBeTrue();
        });
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
