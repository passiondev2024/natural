import {
    AfterViewInit,
    Component,
    ContentChild,
    ElementRef,
    EventEmitter,
    Input,
    OnInit,
    Optional,
    Output,
    Self,
    TemplateRef,
    ViewChild,
} from '@angular/core';
import { ControlValueAccessor, FormControl, NgControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { NaturalFormControl } from '../../classes/form-control';
import { IEnum, NaturalEnumService } from '../../services/enum.service';

@Component({
    selector: 'natural-select-enum',
    templateUrl: './select-enum.component.html',
})
export class NaturalSelectEnumComponent implements OnInit, ControlValueAccessor, AfterViewInit {

    @ViewChild('input') input: ElementRef<HTMLInputElement>;
    @ContentChild(TemplateRef) itemTemplate: TemplateRef<any>;

    @Input() enumName: string;
    @Input() placeholder: string;
    @Input() nullLabel: string;
    @Input() required = false;
    @Input() icon = 'search';
    @Input() displayWith: (item: any) => string;
    @Output() selectionChange = new EventEmitter();
    @Output() blur = new EventEmitter();
    public items: Observable<IEnum[]>;
    public formCtrl: FormControl = new FormControl();
    public onChange;
    /**
     * Stores the value given from parent, it's usually an object. The inner value is formCtrl.value that is a string.
     */
    private value;

    // TODO : replace <any>
    constructor(private enumService: NaturalEnumService<any>, @Optional() @Self() public ngControl: NgControl) {
        if (this.ngControl !== null) {
            this.ngControl.valueAccessor = this;
        }
    }

    @Input() set disabled(disabled: boolean) {
        disabled ? this.formCtrl.disable() : this.formCtrl.enable();
    }

    ngOnInit() {
        this.items = this.enumService.get(this.enumName);
    }

    ngAfterViewInit(): void {

        if (this.ngControl && this.ngControl.control) {
            if ((this.ngControl.control as NaturalFormControl).dirtyChanges) {
                (this.ngControl.control as NaturalFormControl).dirtyChanges.subscribe(() => {
                    this.formCtrl.markAsDirty({onlySelf: true});
                    this.formCtrl.updateValueAndValidity();
                });
            }

            this.formCtrl.setValidators(this.ngControl.control.validator);
        }
    }

    registerOnChange(fn) {
        this.onChange = fn;
    }

    registerOnTouched(fn) {
    }

    writeValue(value) {
        this.value = value;
        this.formCtrl.setValue(this.getDisplayFn()(value));
    }

    public setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    /**
     * Very important to return something, above all if [select]='displayedValue' attribute value is used
     */
    public getDisplayFn(): (item: any) => string {
        if (this.displayWith) {
            return this.displayWith;
        }

        return (item) => !item ? null : item.fullName || item.name || item.id || item;
    }

    public propagateValue(ev) {

        const val = ev.value;

        this.value = val;
        if (this.onChange) {
            this.onChange(val); // before selectionChange to grant formControl is updated before change is effectively emitted
        }
        this.selectionChange.emit(val);
    }

}
