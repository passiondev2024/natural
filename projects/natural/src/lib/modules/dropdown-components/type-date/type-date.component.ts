import {Component, Inject} from '@angular/core';
import {FormControl, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import {DateAdapter, MAT_DATE_FORMATS, MatDateFormats} from '@angular/material/core';
import {BehaviorSubject, merge} from 'rxjs';
import {FilterGroupConditionField} from '../../search/classes/graphql-doctrine.types';
import {NATURAL_DROPDOWN_DATA, NaturalDropdownData} from '../../search/dropdown-container/dropdown.service';
import {DropdownComponent} from '../../search/types/dropdown-component';
import {possibleComparableOperators, PossibleComparableOpertorKeys} from '../types';
import {dateMax, dateMin, serialize} from '../utils';

export interface TypeDateConfiguration<D = any> {
    min?: D | null;
    max?: D | null;
}

@Component({
    templateUrl: './type-date.component.html',
})
export class TypeDateComponent<D = any> implements DropdownComponent {
    public readonly renderedValue = new BehaviorSubject<string>('');
    public readonly configuration: Required<TypeDateConfiguration<D>>;
    public readonly operatorCtrl = new FormControl<PossibleComparableOpertorKeys>('equal', {nonNullable: true});
    public readonly valueCtrl = new FormControl<D | null>(null);
    public readonly operators = possibleComparableOperators;

    public readonly form = new FormGroup({
        operator: this.operatorCtrl,
        value: this.valueCtrl,
    });

    private readonly defaults: Required<TypeDateConfiguration<D>> = {
        min: null,
        max: null,
    };

    public constructor(
        @Inject(NATURAL_DROPDOWN_DATA) data: NaturalDropdownData<TypeDateConfiguration<D>>,
        private dateAdapter: DateAdapter<D>,
        @Inject(MAT_DATE_FORMATS) private dateFormats: MatDateFormats,
    ) {
        this.configuration = {...this.defaults, ...data.configuration};

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
                value: serialize<D>(this.dateAdapter, date),
            };
            condition.less = {
                value: serialize<D>(this.dateAdapter, dayAfter),
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
                value: serialize<D>(this.dateAdapter, date),
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
