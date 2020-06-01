// tslint:disable:directive-class-suffix
import {async, ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {
    NaturalHierarchicConfiguration,
    NaturalHierarchicSelectorModule,
    NaturalIconModule,
    NaturalSelectComponent,
    NaturalSelectModule,
} from '@ecodev/natural';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {By} from '@angular/platform-browser';
import {Component, Directive} from '@angular/core';
import {AnyService} from '../../../testing/any.service';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MockApolloProvider} from '../../../testing/mock-apollo.provider';
import {AbstractSelect} from '../abstract-select.component';

/**
 * Base for test host
 */
@Directive()
abstract class TestHostComponent {
    public selectedValue: any;
    public required = false;
    public blurred = 0;
    public hierarchicConfig: NaturalHierarchicConfiguration[] = [
        {
            service: AnyService,
            parentsRelationNames: ['parent'],
            childrenRelationNames: ['parent'],
            selectableAtKey: 'any',
        },
    ];

    public constructor(public service: AnyService) {}

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

@Directive()
export abstract class TestHostWithNgModelComponent extends TestHostComponent {
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

@Directive()
export abstract class TestHostWithFormControlComponent extends TestHostComponent {
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

export type TestFixture = {
    hostComponent: TestHostComponent;
    selectComponent: AbstractSelect;
    fixture: ComponentFixture<TestHostComponent>;
};

export function testOneComponent(data: TestFixture): void {
    function hasMatError(): boolean {
        const error = data.fixture.debugElement.query(By.css('mat-error'));

        return !!error;
    }

    function getInput(): HTMLInputElement {
        return data.fixture.debugElement.query(By.css('input')).nativeElement;
    }

    it('should create the select', () => {
        expect(data.hostComponent).toBeTruthy();
    });

    it('should change value', () => {
        data.hostComponent.setValue('new value');
        data.fixture.detectChanges();

        expect(data.hostComponent.getValue()).toBe('new value');
    });

    it('should emit blur when internal input emit blur', () => {
        expect(data.hostComponent.blurred).toBe(0);
        const input = getInput();

        input.dispatchEvent(new Event('blur'));
        expect(data.hostComponent.blurred).toBe(1);
    });

    it(`should show error if required and blurred`, () => {
        expect(hasMatError()).toBeFalse();

        data.hostComponent.required = true;

        // Should not have error yet because not touched
        data.fixture.detectChanges();
        expect(hasMatError()).toBeFalse();

        const input = getInput();

        // Touch the element
        input.dispatchEvent(new Event('focus'));
        input.dispatchEvent(new Event('blur'));

        // Now should have error
        data.fixture.detectChanges();
        expect(hasMatError()).toBeTrue();
    });

    it(`should be disabled-able`, () => {
        expect(data.hostComponent.getDisabled()).toBeFalse();

        data.hostComponent.setDisabled(true);

        // Should not have error yet because not touched
        data.fixture.detectChanges();
        expect(data.hostComponent.getDisabled()).toBeTrue();

        const input = getInput();
        expect(input).not.toBeNull();
    });

    it(`should support string value`, fakeAsync(() => {
        data.hostComponent.setValue('my string');
        data.fixture.detectChanges();
        tick(10000);

        // Should show my simple string
        const input = getInput();
        expect(input.value).toBe('my string');
    }));

    it(`should support object with name`, fakeAsync(() => {
        data.hostComponent.setValue({name: 'my name'});
        data.fixture.detectChanges();
        tick(10000);

        // Should show my simple string
        const input = getInput();
        expect(input.value).toBe('my name');
    }));

    it(`should support object with fullName`, fakeAsync(() => {
        data.hostComponent.setValue({fullName: 'my full name'});
        data.fixture.detectChanges();
        tick(10000);

        // Should show my simple string
        const input = getInput();
        expect(input.value).toBe('my full name');
    }));
}
