import {Component, EventEmitter, Input, OnInit, Optional, Output, Self} from '@angular/core';
import {ControlValueAccessor, FormControl, NgControl} from '@angular/forms';
import {Observable} from 'rxjs';
import {IEnum, NaturalEnumService} from '../../services/enum.service';
import {MatSelectChange} from '@angular/material/select';

@Component({
    selector: 'natural-select-enum',
    templateUrl: './select-enum.component.html',
})
export class NaturalSelectEnumComponent implements OnInit, ControlValueAccessor {
    /**
     * The name of the enum type, eg: `"ActionStatus"`
     */
    @Input() enumName: string;

    /**
     * If given an extra option is added to select `null` with given label
     */
    @Input() nullLabel: string | null;

    /**
     * Functions that receives an enum value and returns whether that value is disabled
     */
    @Input() optionDisabled: ((item: IEnum) => boolean) | null = null;

    @Input() placeholder: string;
    @Input() required = false;
    @Output() selectionChange = new EventEmitter<string | null>();
    @Output() blur = new EventEmitter<void>();
    public items: Observable<IEnum[]>;
    public formCtrl: FormControl;
    private onChange;

    constructor(
        private readonly enumService: NaturalEnumService,
        @Optional() @Self() public readonly ngControl: NgControl,
    ) {
        if (this.ngControl) {
            this.ngControl.valueAccessor = this;
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

    public ngOnInit(): void {
        // Try to use formControl from [(ngModel)] or [formControl], otherwise create our own control
        if (this.ngControl?.control instanceof FormControl) {
            this.formCtrl = this.ngControl.control;
        } else {
            this.formCtrl = new FormControl();
        }

        this.items = this.enumService.get(this.enumName);
    }

    public registerOnChange(fn): void {
        this.onChange = fn;
    }

    public registerOnTouched(fn): void {}

    public writeValue(value): void {}

    public setDisabledState(isDisabled: boolean): void {}

    public propagateValue(event: MatSelectChange): void {
        const value = event.value;

        if (this.onChange) {
            this.onChange(value); // before selectionChange to allow formControl to update before change is effectively emitted
        }

        this.selectionChange.emit(value);
    }
}
