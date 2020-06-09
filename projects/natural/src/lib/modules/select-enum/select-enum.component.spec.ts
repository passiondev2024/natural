// tslint:disable:directive-class-suffix
import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {
    NaturalEnumService,
    NaturalHierarchicSelectorModule,
    NaturalIconModule,
    NaturalSelectComponent,
    NaturalSelectEnumComponent,
    NaturalSelectEnumModule,
} from '@ecodev/natural';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {By} from '@angular/platform-browser';
import {Component, Directive} from '@angular/core';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {AnyEnumService} from '../../testing/any-enum.service';
import {MockApolloProvider} from '../../testing/mock-apollo.provider';

/**
 * Base for test host
 */
@Directive()
abstract class TestHostComponent {
    public selectedValue: any;
    public required = false;
    public blurred = 0;

    public onSelection($event: any): void {
        this.selectedValue = $event;
    }

    public onBlur() {
        this.blurred++;
    }

    public abstract getDisabled(): boolean;

    public abstract setDisabled(disabled: boolean): void;

    public abstract getValue(): any;

    public abstract setValue(value: any): void;
}

@Component({
    template: `
        <natural-select-enum
            enumName="FooEnum"
            [required]="required"
            [disabled]="disabled"
            (selectionChange)="onSelection($event)"
            (blur)="onBlur()"
            [(ngModel)]="myValue"
            placeholder="ngModel"
        ></natural-select-enum>
    `,
})
class TestHostWithNgModelComponent extends TestHostComponent {
    public myValue: any;
    public disabled = false;

    public getDisabled(): boolean {
        return this.disabled;
    }

    public setDisabled(disabled: boolean): void {
        this.disabled = disabled;
    }

    public getValue(): any {
        return this.myValue;
    }

    public setValue(value: any): void {
        this.myValue = value;
    }
}

@Component({
    template: `
        <natural-select-enum
            enumName="FooEnum"
            [required]="required"
            (selectionChange)="onSelection($event)"
            (blur)="onBlur()"
            [formControl]="formControl"
            placeholder="formControl"
        ></natural-select-enum>
    `,
})
class TestHostWithFormControlComponent extends TestHostComponent {
    public formControl = new FormControl();

    public getDisabled(): boolean {
        return this.formControl.disabled;
    }

    public setDisabled(disabled: boolean): void {
        if (disabled) {
            this.formControl.disable();
        } else {
            this.formControl.enable();
        }
    }

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
describe('NaturalSelectEnumComponent', () => {
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
                NaturalSelectEnumModule,
                NaturalHierarchicSelectorModule,
                NaturalIconModule.forRoot({}),
            ],
            declarations: [TestHostWithNgModelComponent, TestHostWithFormControlComponent],
            providers: [
                {
                    provide: NaturalEnumService,
                    useClass: AnyEnumService,
                },
                MockApolloProvider,
            ],
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

    fdescribe('with formControl', () => {
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
        const input: HTMLElement = data.fixture.debugElement.query(By.css('mat-select')).nativeElement;

        input.dispatchEvent(new Event('blur'));
        expect(data.component.blurred).toBe(1);
    });

    it(`should show error if required and blurred`, () => {
        expect(hasMatError()).toBeFalse();

        data.component.required = true;

        // Should not have error yet because not touched
        data.fixture.detectChanges();
        expect(hasMatError()).toBeFalse();

        const input: HTMLElement = data.fixture.debugElement.query(By.css('mat-select')).nativeElement;

        // Touch the element
        input.dispatchEvent(new Event('focus'));
        input.dispatchEvent(new Event('blur'));

        // Now should have error
        data.fixture.detectChanges();
        expect(hasMatError()).toBeTrue();
    });

    it(`should be disabled-able`, () => {
        expect(data.component.getDisabled()).toBeFalse();

        data.component.setDisabled(true);

        // Should not have error yet because not touched
        data.fixture.detectChanges();
        expect(data.component.getDisabled()).toBeTrue();

        const input = data.fixture.debugElement.query(By.css('mat-select.mat-select-disabled'));
        expect(input).not.toBeNull();
    });

    fit(`a single option should be disabled-able`, () => {
        // Set disabled option
        const selectComponent: NaturalSelectEnumComponent = data.fixture.debugElement.query(
            By.directive(NaturalSelectEnumComponent),
        ).context;
        selectComponent.optionDisabled = item => item.value === 'val2';

        // Open the mat-select
        const matSelect = data.fixture.debugElement.query(By.css('.mat-select-trigger')).nativeElement;
        matSelect.click();
        data.fixture.detectChanges();

        const disabledOptions = data.fixture.debugElement.queryAll(By.css('.mat-option-disabled'));
        expect(disabledOptions.length).toBe(1);
    });
}
