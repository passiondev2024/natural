import {Component, Inject} from '@angular/core';
import {UntypedFormControl, FormGroupDirective, NgForm, Validators} from '@angular/forms';
import {ErrorStateMatcher} from '@angular/material/core';
import {BehaviorSubject} from 'rxjs';
import {FilterGroupConditionField} from '../../search/classes/graphql-doctrine.types';
import {NaturalDropdownRef} from '../../search/dropdown-container/dropdown-ref';
import {NATURAL_DROPDOWN_DATA, NaturalDropdownData} from '../../search/dropdown-container/dropdown.service';
import {DropdownComponent} from '../../search/types/dropdown-component';

export class InvalidWithValueStateMatcher implements ErrorStateMatcher {
    public isErrorState(control: UntypedFormControl | null, form: FormGroupDirective | NgForm | null): boolean {
        return control && control.invalid && control.value;
    }
}

@Component({
    templateUrl: './type-text.component.html',
    styleUrls: ['./type-text.component.scss'],
})
export class TypeTextComponent implements DropdownComponent {
    public renderedValue = new BehaviorSubject<string>('');
    public formCtrl: UntypedFormControl = new UntypedFormControl();
    public matcher = new InvalidWithValueStateMatcher();

    public constructor(
        @Inject(NATURAL_DROPDOWN_DATA) data: NaturalDropdownData<never>,
        protected dropdownRef: NaturalDropdownRef,
    ) {
        this.formCtrl.valueChanges.subscribe(value => {
            this.renderedValue.next(value === null ? '' : this.formCtrl.value + '');
        });

        this.formCtrl.setValidators([Validators.required]);

        if (data.condition && data.condition.like) {
            this.formCtrl.setValue(data.condition.like.value);
        }
    }

    public getCondition(): FilterGroupConditionField {
        return {like: {value: this.formCtrl.value}};
    }

    public isValid(): boolean {
        return this.formCtrl.valid;
    }

    public isDirty(): boolean {
        return this.formCtrl.dirty;
    }

    public close(): void {
        if (this.isValid()) {
            this.dropdownRef.close({condition: this.getCondition()});
        } else {
            this.dropdownRef.close(); // undefined value, discard changes / prevent to add a condition (on new fields
        }
    }
}
