// tslint:disable:directive-class-suffix
import {Directive, EventEmitter, Input, OnDestroy, OnInit, Optional, Output, Self} from '@angular/core';
import {ControlValueAccessor, FormControl, NgControl} from '@angular/forms';
import {NaturalAbstractController} from '../../classes/abstract-controller';
import {Literal} from '../../types/types';
import {FloatLabelType} from '@angular/material/form-field/form-field';

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
    public formCtrl: FormControl;

    /**
     * Interface with ControlValueAccessor
     * Notifies parent model / form controller
     */
    protected onChange;

    constructor(@Optional() @Self() public readonly ngControl: NgControl) {
        super();

        if (this.ngControl) {
            this.ngControl.valueAccessor = this;
        }
    }

    public writeValue(value: V | null): void {
        // Nothing to do here, because we do it either via syncControls() for hierarchic,
        // or everything happen automatically through formCtrl for non-hierarchic
    }

    public ngOnInit(): void {
        // Try to use formControl from [(ngModel)] or [formControl], otherwise create our own control
        if (this.ngControl?.control instanceof FormControl) {
            this.formCtrl = this.ngControl.control;
        } else {
            this.formCtrl = new FormControl();
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

    public registerOnTouched(fn): void {}

    public abstract getDisplayFn(): (item: V | null) => string;

    public clear(emitEvent = true): void {
        // Empty input
        this.formCtrl.setValue(null, {emitEvent: emitEvent});
        this.formCtrl.markAsTouched();

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

    public setDisabledState(isDisabled: boolean): void {}

    public showClearButton(): boolean {
        return this.formCtrl?.enabled && this.clearLabel && this.formCtrl.value;
    }
}
