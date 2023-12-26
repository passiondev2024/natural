import {Component, Inject} from '@angular/core';
import {FormControl, Validators, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ErrorStateMatcher} from '@angular/material/core';
import {BehaviorSubject} from 'rxjs';
import {FilterGroupConditionField} from '../../search/classes/graphql-doctrine.types';
import {NaturalDropdownRef} from '../../search/dropdown-container/dropdown-ref';
import {NATURAL_DROPDOWN_DATA, NaturalDropdownData} from '../../search/dropdown-container/dropdown.service';
import {DropdownComponent} from '../../search/types/dropdown-component';
import {CommonModule} from '@angular/common';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';

/**
 * Show an error message if the control has a value and an error, even if control is not dirty and not touched.
 */
export class InvalidWithValueStateMatcher implements ErrorStateMatcher {
    public isErrorState(control: FormControl | null): boolean {
        return control && control.invalid && control.value;
    }
}

@Component({
    templateUrl: './type-text.component.html',
    styleUrls: ['./type-text.component.scss'],
    standalone: true,
    imports: [MatFormFieldModule, MatInputModule, FormsModule, ReactiveFormsModule, CommonModule],
})
export class TypeTextComponent implements DropdownComponent {
    public readonly renderedValue = new BehaviorSubject<string>('');
    public readonly formCtrl = new FormControl('', {nonNullable: true});
    public readonly matcher = new InvalidWithValueStateMatcher();

    public constructor(
        @Inject(NATURAL_DROPDOWN_DATA) data: NaturalDropdownData<never>,
        protected dropdownRef: NaturalDropdownRef,
    ) {
        this.formCtrl.valueChanges.subscribe(value => {
            this.renderedValue.next(value === null ? '' : this.formCtrl.value + '');
        });

        this.formCtrl.setValidators([Validators.required]);

        if (data.condition && data.condition.like) {
            this.formCtrl.setValue('' + data.condition.like.value);
        }
    }

    public getCondition(): FilterGroupConditionField {
        if (!this.formCtrl.value) {
            return {};
        }

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
