// tslint:disable:directive-class-suffix
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {Directive, DoCheck, EventEmitter, Input, OnDestroy, OnInit, Optional, Output, Self} from '@angular/core';
import {
    AbstractControl,
    ControlValueAccessor,
    FormControl,
    FormControlDirective,
    FormControlName,
    FormGroupDirective,
    NgControl,
    NgForm,
    Validators,
} from '@angular/forms';
import {ErrorStateMatcher} from '@angular/material/core';
import {FloatLabelType} from '@angular/material/form-field';
import {NaturalAbstractController} from '../../classes/abstract-controller';

/**
 * This will completely ignore local formControl and instead use the one from the component
 * which comes from outside of this component. This basically allows us to **not** depend on
 * touched status propagation between outside and inside world, and thus get rid of our legacy
 * custom FormControl class ("NaturalFormControl").
 */
class ExternalFormControlMatcher<T> extends ErrorStateMatcher {
    public constructor(private readonly component: AbstractSelect<T>) {
        super();
    }

    public isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
        const formCtrl = this.component.ngControl?.control || this.component.formCtrl;
        if (formCtrl) {
            return !!(formCtrl.errors && (formCtrl.touched || formCtrl.dirty));
        }

        return false;
    }
}

@Directive()
export abstract class AbstractSelect<V>
    extends NaturalAbstractController
    implements OnInit, OnDestroy, ControlValueAccessor, DoCheck {
    @Input() public placeholder?: string;
    @Input() public floatPlaceholder: FloatLabelType = 'auto';

    /**
     * If the field is required
     */
    @Input() set required(value: boolean) {
        this._required = coerceBooleanProperty(value);
        this.applyRequired();
    }

    get required(): boolean {
        return !!this._required;
    }

    private _required: boolean | undefined;

    /**
     * Add a suffix button that is a link to given destination
     */
    @Input() public navigateTo?: any[] | string | null;

    /**
     * If provided cause a new clear button to appear
     */
    @Input() public clearLabel?: string;

    /**
     * Whether to show the search icon
     */
    @Input() public showIcon = true;

    /**
     * Icon name
     */
    @Input() public icon = 'search';

    /**
     * Function to customize the rendering of the selected item as text in input
     */
    @Input() public displayWith?: (item: V | null) => string;

    /**
     * Emit the selected value whenever it changes
     */
    @Output() public readonly selectionChange = new EventEmitter<V | null>();

    /**
     * Emits when inner input is blurred
     */
    @Output() public readonly blur = new EventEmitter<void>();

    /**
     *
     */
    public formCtrl: FormControl = new FormControl();

    /**
     * Interface with ControlValueAccessor
     * Notifies parent model / form controller
     */
    public onChange?: (item: V | null) => void;

    /**
     * Interface with ControlValueAccessor
     * Notifies parent model / form controller
     */
    public onTouched?: () => void;

    public matcher: ExternalFormControlMatcher<V>;

    constructor(@Optional() @Self() public readonly ngControl: NgControl) {
        super();

        if (this.ngControl) {
            this.ngControl.valueAccessor = this;
        }

        this.matcher = new ExternalFormControlMatcher(this);
    }

    public ngDoCheck(): void {
        if (this.formCtrl && this.ngControl) {
            this.applyRequired();
        }
    }

    public writeValue(value: V | null): void {
        if (this.formCtrl) {
            this.formCtrl.setValue(this.getDisplayFn()(value));
        }
    }

    public ngOnInit(): void {
        const isReactive = this.ngControl instanceof FormControlDirective || this.ngControl instanceof FormControlName;
        if (isReactive && typeof this._required !== 'undefined') {
            console.warn('<natural-select-*> should not be used as ReactiveForm and with the [required] attribute');
        }
    }

    /**
     * Whether the value can be changed
     */
    @Input() set disabled(disabled: boolean) {
        if (this.formCtrl) {
            disabled ? this.formCtrl.disable() : this.formCtrl.enable();
        }
    }

    public registerOnChange(fn: (item: V | null) => void): void {
        this.onChange = fn;
    }

    public registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    public abstract getDisplayFn(): (item: V | null) => string;

    public clear(emitEvent = true): void {
        // Empty input
        this.formCtrl.setValue(null, {emitEvent: emitEvent});

        // propagateValue change
        if (emitEvent) {
            this.propagateValue(null);
        }
    }

    public propagateValue(value: V | null): void {
        // before selectionChange to allow formControl to update before change is effectively emitted
        if (this.onChange) {
            this.onChange(value);
        }

        this.selectionChange.emit(value);
    }

    public setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    public showClearButton(): boolean {
        return this.formCtrl?.enabled && this.clearLabel && this.formCtrl.value;
    }

    public touch(): void {
        if (this.onTouched) {
            this.onTouched();
        }
    }

    public hasRequiredError(): boolean {
        const control = this.ngControl?.control ? this.ngControl?.control : this.formCtrl;

        return control.hasError('required');
    }

    /**
     * Apply Validators.required on the inner form, based on ngControl or [required] attribute, giving priority to attribute.
     */
    private applyRequired(): void {
        // Required status on parent validator
        const outerRequiredStatus = this?.ngControl?.control?.validator?.({} as AbstractControl)?.required;

        // Wanted required status, giving priority to template
        const newRequiredStatus = typeof this._required !== 'undefined' ? this._required : outerRequiredStatus;

        // Actual inner validation status
        const currentRequiredStatus = this.formCtrl?.validator?.({} as AbstractControl)?.required;

        // If wanted status is similar to actual status, stop everything
        if (currentRequiredStatus === newRequiredStatus) {
            return;
        }

        // Apply only if changed
        if (newRequiredStatus) {
            this.formCtrl.setValidators(Validators.required);
        } else {
            this.formCtrl.clearValidators();
        }

        this.formCtrl.updateValueAndValidity();
    }
}
