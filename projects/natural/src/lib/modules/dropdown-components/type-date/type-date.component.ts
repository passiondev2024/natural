import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MatDateFormats } from '@angular/material/core';
import { BehaviorSubject, merge } from 'rxjs';
import { FilterGroupConditionField } from '../../search/classes/graphql-doctrine.types';
import { NATURAL_DROPDOWN_DATA, NaturalDropdownData } from '../../search/dropdown-container/dropdown.service';
import { DropdownComponent } from '../../search/types/dropdown-component';
import { possibleOperators } from '../types';

export interface TypeDateConfiguration<D = any> {
    min?: D | null;
    max?: D | null;
}

/**
 * Min date validator
 */
function dateMin<D>(dateAdapter: DateAdapter<D>, min: D): ValidatorFn {
    return (control: FormControl): ValidationErrors | null => {
        if (control.value && dateAdapter.compareDate(control.value, min) < 0) {
            return {min: true};
        }

        return null;
    };
}

/**
 * Max date validator
 */
function dateMax<D>(dateAdapter: DateAdapter<D>, max: D): ValidatorFn {
    return (control: FormControl): ValidationErrors | null => {
        if (control.value && dateAdapter.compareDate(control.value, max) > 0) {
            return {max: true};
        }

        return null;
    };
}

@Component({
    templateUrl: './type-date.component.html',
})
export class TypeDateComponent<D = any> implements DropdownComponent {

    public renderedValue = new BehaviorSubject<string>('');
    public configuration: TypeDateConfiguration<D>;
    public operatorCtrl: FormControl = new FormControl('equal');
    public valueCtrl: FormControl = new FormControl();
    public readonly operators = possibleOperators;

    public form: FormGroup;

    private readonly defaults: TypeDateConfiguration<D> = {
        min: null,
        max: null,
    };

    constructor(
        @Inject(NATURAL_DROPDOWN_DATA) data: NaturalDropdownData<TypeDateConfiguration<D>>,
        private dateAdapter: DateAdapter<D>,
        @Inject(MAT_DATE_FORMATS) private dateFormats: MatDateFormats,
    ) {
        this.configuration = {...this.defaults, ...data.configuration};
        this.form = new FormGroup({
            operator: this.operatorCtrl,
            value: this.valueCtrl,
        });

        merge(this.operatorCtrl.valueChanges, this.valueCtrl.valueChanges).subscribe(() => {
            this.renderedValue.next(this.getRenderedValue());
        });

        this.initValidators();
        this.reloadCondition(data.condition);
    }

    public getCondition(): FilterGroupConditionField {
        if (!this.valueCtrl.value) {
            return {};
        }

        const condition: FilterGroupConditionField = {};
        let operator = this.operatorCtrl.value;
        let date = this.valueCtrl.value;
        const dayAfter = this.getDayAfter(date);
        if (operator === 'equal') {
            condition.greaterOrEqual = {
                value: this.serialize(date),
            };
            condition.less = {
                value: this.serialize(dayAfter),
            };
        } else {

            // Transparently adapt exclusive/inclusive ranges
            if (operator === 'greater') {
                operator = 'greaterOrEqual';
                date = dayAfter;
            } else if (operator === 'lessOrEqual') {
                operator = 'less';
                date = dayAfter;
            }

            condition[operator] = {
                value: this.serialize(date),
            };
        }

        return condition;
    }

    public isValid(): boolean {
        return this.form.valid;
    }

    public isDirty(): boolean {
        return this.form.dirty;
    }

    private reloadCondition(condition: FilterGroupConditionField | null): void {
        if (!condition) {
            return;
        }

        // Special case for '='
        if (condition.greaterOrEqual && condition.less) {
            this.operatorCtrl.setValue('equal');
            const value = this.dateAdapter.deserialize(condition.greaterOrEqual.value);
            this.valueCtrl.setValue(value);

            return;
        }

        for (const operator of this.operators) {
            const reloadedOperator = condition[operator.key];
            if (reloadedOperator) {
                this.operatorCtrl.setValue(operator.key);

                const value = this.dateAdapter.deserialize(reloadedOperator.value);
                this.valueCtrl.setValue(value);
            }
        }
    }

    private initValidators(): void {
        const validators: ValidatorFn[] = [Validators.required];
        if (this.configuration.min) {
            validators.push(dateMin<D>(this.dateAdapter, this.configuration.min));
        }

        if (this.configuration.max) {
            validators.push(dateMax<D>(this.dateAdapter, this.configuration.max));
        }

        this.valueCtrl.setValidators(validators);
    }

    private getDayAfter(date: D): D {
        return this.dateAdapter.addCalendarDays(this.dateAdapter.clone(date), 1);
    }

    private serialize(value: D | null): string {
        if (!value) {
            return '';
        }

        // Get only date, without time and ignoring entirely the timezone
        const y = this.dateAdapter.getYear(value);
        const m = this.dateAdapter.getMonth(value) + 1;
        const d = this.dateAdapter.getDate(value);

        return y
               + '-'
               + (m < 10 ? '0' : '') + m
               + '-'
               + (d < 10 ? '0' : '') + d;
    }

    private getRenderedValue(): string {
        const operator = this.operators.find(v => v.key === this.operatorCtrl.value);
        if (this.valueCtrl.value === null || !operator) {
            return '';
        } else {
            const value = this.dateAdapter.format(this.valueCtrl.value, this.dateFormats.display.dateInput);

            return operator.label + ' ' + value;
        }
    }

}
