// tslint:disable:directive-class-suffix
import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {
    NaturalHierarchicSelectorModule,
    NaturalIconModule,
    NaturalSelectComponent,
    NaturalSelectModule,
} from '@ecodev/natural';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {By} from '@angular/platform-browser';
import {Component, Directive} from '@angular/core';
import {AnyService} from '../../testing/any.service';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MockApolloProvider} from '../../testing/mock-apollo.provider';

/**
 * Base for test host
 */
@Directive()
abstract class TestHostComponent {
    public selectedValue: any;
    public required = false;
    public blurred = 0;

    public constructor(public service: AnyService) {}

    public onSelection($event: any): void {
        this.selectedValue = $event;
    }

    public onBlur() {
        this.blurred++;
    }

    public abstract getValue(): any;

    public abstract setValue(value: any): void;
}

@Component({
    template: `
        <natural-select
            [service]="service"
            [required]="required"
            (selectionChange)="onSelection($event)"
            (blur)="onBlur()"
            [(ngModel)]="myValue"
            placeholder="ngModel"
        ></natural-select>
    `,
})
class TestHostWithNgModelComponent extends TestHostComponent {
    public myValue: any;

    public getValue(): any {
        return this.myValue;
    }

    public setValue(value: any): void {
        this.myValue = value;
    }
}

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
class TestHostWithFormControlComponent extends TestHostComponent {
    public formControl = new FormControl();

    public getValue(): any {
        return this.formControl.value;
    }

    public setValue(value: any): void {
        this.formControl.setValue(value);
    }
}

type TestFixture = {
    component: TestHostComponent;
    fixture: ComponentFixture<TestHostComponent>;
};
describe('NaturalSelectComponent', () => {
    const data: TestFixture = {
        component: null as any,
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
            declarations: [TestHostWithNgModelComponent, TestHostWithFormControlComponent],
            providers: [MockApolloProvider],
        }).compileComponents();
    }));

    describe('with ngModel', () => {
        beforeEach(() => {
            data.fixture = TestBed.createComponent(TestHostWithNgModelComponent);
            data.component = data.fixture.componentInstance;
            data.fixture.detectChanges();
        });

        testOneComponent(data);
    });

    describe('with formControl', () => {
        beforeEach(() => {
            data.fixture = TestBed.createComponent(TestHostWithFormControlComponent);
            data.component = data.fixture.componentInstance;
            data.fixture.detectChanges();
        });

        testOneComponent(data);
    });
});

function testOneComponent(data: TestFixture): void {
    function hasMatError(): boolean {
        const error = data.fixture.debugElement.query(By.css('mat-error'));

        return !!error;
    }

    it('should create the select', () => {
        expect(data.component).toBeTruthy();
    });

    it('should change value', () => {
        data.component.setValue('new value');
        data.fixture.detectChanges();

        expect(data.component.getValue()).toBe('new value');
    });

    it('should emit blur when internal input emit blur', () => {
        expect(data.component.blurred).toBe(0);
        const input: HTMLElement = data.fixture.debugElement.query(By.css('input')).nativeElement;

        input.dispatchEvent(new Event('blur'));
        expect(data.component.blurred).toBe(1);
    });

    it(`should show error if required and blurred`, () => {
        expect(hasMatError()).toBeFalse();

        data.component.required = true;

        // Should not have error yet because not touched
        data.fixture.detectChanges();
        expect(hasMatError()).toBeFalse();

        const input: HTMLElement = data.fixture.debugElement.query(By.css('input')).nativeElement;

        // Touch the element
        input.dispatchEvent(new Event('focus'));
        input.dispatchEvent(new Event('blur'));

        // Now should have error
        data.fixture.detectChanges();
        expect(hasMatError()).toBeTrue();
    });
}
