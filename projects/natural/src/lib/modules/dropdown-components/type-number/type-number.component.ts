import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, FormGroupDirective, NgForm, ValidatorFn, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material';
import { BehaviorSubject, merge } from 'rxjs';
import { FilterGroupConditionField } from '../../search/classes/graphql-doctrine.types';
import { NaturalDropdownRef } from '../../search/dropdown-container/dropdown-ref';
import { NATURAL_DROPDOWN_DATA, NaturalDropdownData } from '../../search/dropdown-container/dropdown.service';
import { DropdownComponent } from '../../search/types/DropdownComponent';
import { PossibleOperators } from '../types';

export interface TypeNumberConfiguration {
    min?: number | null;
    max?: number | null;
    step?: number | null;
}

export class InvalidWithValueStateMatcher implements ErrorStateMatcher {
    isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
        return control && control.invalid && control.value;
    }
}

@Component({
    templateUrl: './type-number.component.html',
    styleUrls: ['./type-number.component.scss'],

})
export class TypeNumberComponent implements DropdownComponent {

    public renderedValue = new BehaviorSubject<string>('');
    public configuration: TypeNumberConfiguration = {};
    public operatorCtrl: FormControl = new FormControl('equal');
    public valueCtrl: FormControl = new FormControl();
    public matcher = new InvalidWithValueStateMatcher();
    public form: FormGroup;
    public readonly operators: PossibleOperators = {
        less: '<',
        lessOrEqual: '≤',
        equal: '=',
        greaterOrEqual: '≥',
        greater: '>',
    };

    constructor(
        @Inject(NATURAL_DROPDOWN_DATA) data: NaturalDropdownData<TypeNumberConfiguration>,
        protected dropdownRef: NaturalDropdownRef,
    ) {
        this.configuration = data.configuration || {};
        this.form = new FormGroup({
            operator: this.operatorCtrl,
            value: this.valueCtrl,
        });

        merge(this.operatorCtrl.valueChanges, this.valueCtrl.valueChanges).subscribe(() => {
            const rendered = this.valueCtrl.value === null ? '' : this.operators[this.operatorCtrl.value] + ' ' + this.valueCtrl.value;
            this.renderedValue.next(rendered);
        });

        this.initValidators();
        this.reloadCondition(data.condition);
    }

    private initValidators(): void {
        const validators: ValidatorFn[] = [Validators.required];
        if (this.configuration.min) {
            validators.push(Validators.min(this.configuration.min));
        }

        if (this.configuration.max) {
            validators.push(Validators.max(this.configuration.max));
        }

        this.valueCtrl.setValidators(validators);
    }

    private reloadCondition(condition: FilterGroupConditionField | null): void {
        if (!condition) {
            return;
        }

        for (const key in this.operators) {
            if (condition[key]) {
                this.operatorCtrl.setValue(key);
                this.valueCtrl.setValue(condition[key].value);
            }
        }
    }

    public getCondition(): FilterGroupConditionField {
        const condition: FilterGroupConditionField = {};
        condition[this.operatorCtrl.value] = {
            value: this.valueCtrl.value,
        };

        return condition;
    }

    public isValid(): boolean {
        return this.form.valid;
    }

    public isDirty(): boolean {
        return this.form.dirty;
    }

    public close(): void {
        if (this.isValid()) {
            this.dropdownRef.close({condition: this.getCondition()});
        } else {
            this.dropdownRef.close(); // undefined value, discard changes / prevent to add a condition (on new fields
        }
    }

}
