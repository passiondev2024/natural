// tslint:disable:directive-class-suffix
import {ComponentFixture, fakeAsync, tick} from '@angular/core/testing';
import {Literal, NaturalHierarchicConfiguration} from '@ecodev/natural';
import {By} from '@angular/platform-browser';
import {DebugElement, Directive} from '@angular/core';
import {AnyService} from '../../../testing/any.service';
import {FormControl, Validators} from '@angular/forms';
import {AbstractSelect} from '../abstract-select.component';

/**
 * Base for test host
 */
@Directive()
abstract class TestHostComponent {
    public selectedValue: any;
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

    public abstract setRequired(): void;
}

@Directive()
export abstract class AbstractTestHostWithNgModelComponent extends TestHostComponent {
    public myValue: any;
    public disabled = false;
    public required = false;

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

    public setRequired(): void {
        this.required = true;
    }
}

@Directive()
export abstract class AbstractTestHostWithFormControlComponent extends TestHostComponent {
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

    public setRequired(): void {
        this.formControl.setValidators(Validators.required);
        this.formControl.updateValueAndValidity();
    }
}

export type TestFixture<T extends AbstractSelect<any> = AbstractSelect<any>> = {
    hostComponent: TestHostComponent;
    selectComponent: T;
    fixture: ComponentFixture<TestHostComponent>;
};

export function hasMatError(data: TestFixture): boolean {
    const error = data.fixture.debugElement.query(By.css('mat-error'));

    return !!error;
}

export function getNativeInput(data: TestFixture): HTMLInputElement {
    return data.fixture.debugElement.query(By.css('input')).nativeElement;
}

export function getNativeDisabledInput(data: TestFixture): DebugElement | null {
    return data.fixture.debugElement.query(By.css('input[disabled]'));
}

export function testAllSelectCommonBehavior(
    data: TestFixture,
    getInput: (data: TestFixture) => HTMLInputElement,
    getDisabledInput: (data: TestFixture) => DebugElement | null,
): void {
    it('should create the select inside the host', () => {
        expect(data.selectComponent).toBeTruthy();
    });

    it('should change value', () => {
        data.hostComponent.setValue('new value');
        data.fixture.detectChanges();

        expect(data.hostComponent.getValue()).toBe('new value');
    });

    it('should emit blur when internal input emit blur', () => {
        expect(data.hostComponent.blurred).toBe(0);
        const input = getInput(data);

        input.dispatchEvent(new Event('blur'));
        expect(data.hostComponent.blurred).toBe(1);
    });

    it(`should show error if required and blurred`, fakeAsync(() => {
        expect(hasMatError(data)).toBeFalse();
        data.hostComponent.setRequired();

        // Should not have error yet because not touched
        data.fixture.detectChanges();
        expect(hasMatError(data)).toBeFalse();

        const input = getInput(data);

        // Touch the element
        input.dispatchEvent(new Event('focus'));
        data.fixture.detectChanges();
        input.dispatchEvent(new Event('blur'));
        tick(10000);
        data.fixture.detectChanges();

        expect(hasMatError(data)).toBeTrue();
    }));

    it(`should be disabled-able`, () => {
        expect(data.hostComponent.getDisabled()).toBeFalse();
        expect(getDisabledInput(data)).toBeNull();

        data.hostComponent.setDisabled(true);
        data.fixture.detectChanges();

        expect(data.hostComponent.getDisabled()).toBeTrue();
        expect(getDisabledInput(data)).not.toBeNull();
    });
}

export function testSelectAndSelectHierarchicCommonBehavior(data: TestFixture): void {
    testAllSelectCommonBehavior(data, getNativeInput, getNativeDisabledInput);

    it(`should support string value`, fakeAsync(() => {
        data.hostComponent.setValue('my string');
        data.fixture.detectChanges();
        tick(10000);

        // Should show my simple string
        const input = getNativeInput(data);
        expect(input.value).toBe('my string');
    }));

    it(`should support object with name`, fakeAsync(() => {
        data.hostComponent.setValue({name: 'my name'});
        data.fixture.detectChanges();
        tick(10000);

        // Should show my simple string
        const input = getNativeInput(data);
        expect(input.value).toBe('my name');
    }));

    it(`should support object with fullName`, fakeAsync(() => {
        data.hostComponent.setValue({fullName: 'my full name'});
        data.fixture.detectChanges();
        tick(10000);

        // Should show my simple string
        const input = getNativeInput(data);
        expect(input.value).toBe('my full name');
    }));
}
