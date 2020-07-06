// tslint:disable:directive-class-suffix
import {Directive, EventEmitter, Input, OnDestroy, OnInit, Optional, Output, Self} from '@angular/core';
import {
    ControlValueAccessor,
    FormControl,
    FormControlDirective,
    FormControlName,
    FormGroupDirective,
    NgControl,
    NgForm,
} from '@angular/forms';
import {ErrorStateMatcher} from '@angular/material/core';
import {FloatLabelType} from '@angular/material/form-field';
import {NaturalAbstractController} from '../../classes/abstract-controller';
import {Literal} from '../../types/types';

/**
 * This will completely ignore local formControl and instead use the one from the component
 * which comes from outside of this component. This basically allows us to **not** depend on
 * touched status propagation between outside and inside world, and thus get rid of our legacy
 * custom FormControl class ("NaturalFormControl").
 */
class ExternalFormControlMatcher extends ErrorStateMatcher {
    public constructor(private readonly component: AbstractSelect) {
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
export abstract class AbstractSelect<V = Literal> extends NaturalAbstractController
    implements OnInit, OnDestroy, ControlValueAccessor {
    @Input() placeholder: string;
    @Input() floatPlaceholder: FloatLabelType | null = null;
    @Input() required = false;

    /**
     * Add a suffix button that is a link to given destination
     */
    @Input() navigateTo: any[] | string | null;

    /**
     * If provided cause a new clear button to appear
     */
    @Input() clearLabel: string;

    /**
     * Whether to show the search icon
     */
    @Input() showIcon = true;

    /**
     * Icon name
     */
    @Input() icon = 'search';

    /**
     * Function to customize the rendering of the selected item as text in input
     */
    @Input() displayWith: (item: V | null) => string;

    /**
     * Emit the selected value whenever it changes
     */
    @Output() selectionChange = new EventEmitter<V | null>();

    /**
     * Emits when inner input is blurred
     */
    @Output() blur = new EventEmitter<void>();

    /**
     *
     */
    public formCtrl: FormControl = new FormControl();

    /**
     * Interface with ControlValueAccessor
     * Notifies parent model / form controller
     */
    public onChange;

    /**
     * Interface with ControlValueAccessor
     * Notifies parent model / form controller
     */
    public onTouched;

    public matcher: ExternalFormControlMatcher;

    constructor(@Optional() @Self() public readonly ngControl: NgControl) {
        super();

        if (this.ngControl) {
            this.ngControl.valueAccessor = this;
        }

        this.matcher = new ExternalFormControlMatcher(this);
    }

    public writeValue(value: V | null): void {
        if (this.formCtrl) {
            this.formCtrl.setValue(this.getDisplayFn()(value));
        }
    }

    public ngOnInit(): void {
        const isReactive = this.ngControl instanceof FormControlDirective || this.ngControl instanceof FormControlName;
        if (isReactive && this.required) {
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

    public registerOnChange(fn): void {
        this.onChange = fn;
    }

    public registerOnTouched(fn): void {
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
}
