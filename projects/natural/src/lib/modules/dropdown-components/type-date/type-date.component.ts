import {Component, Inject} from '@angular/core';
import {FormControl, FormGroup, ValidatorFn, Validators, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {DateAdapter, MAT_DATE_FORMATS, MatDateFormats, MatOptionModule} from '@angular/material/core';
import {BehaviorSubject, merge} from 'rxjs';
import {FilterGroupConditionField, Scalar} from '../../search/classes/graphql-doctrine.types';
import {NATURAL_DROPDOWN_DATA, NaturalDropdownData} from '../../search/dropdown-container/dropdown.service';
import {DropdownComponent} from '../../search/types/dropdown-component';
import {possibleComparableOperators, PossibleComparableOpertorKeys} from '../types';
import {dateMax, dateMin, serialize} from '../utils';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';

export type TypeDateConfiguration<D = Date> = {
    min?: D | null;
    max?: D | null;
};

@Component({
    templateUrl: './type-date.component.html',
    styleUrl: './type-date.component.scss',
    standalone: true,
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatSelectModule,
        MatOptionModule,
        MatInputModule,
        MatDatepickerModule,
        MatCheckboxModule,
    ],
})
export class TypeDateComponent<D = any> implements DropdownComponent {
    public readonly renderedValue = new BehaviorSubject<string>('');
    public readonly configuration: Required<TypeDateConfiguration<D>>;
    public readonly operatorCtrl = new FormControl<PossibleComparableOpertorKeys>('equal', {nonNullable: true});
    public readonly valueCtrl = new FormControl<D | null>(null);
    public readonly todayCtrl = new FormControl(false);
    public readonly operators = possibleComparableOperators;

    public readonly form = new FormGroup({
        operator: this.operatorCtrl,
        value: this.valueCtrl,
        today: this.todayCtrl,
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

        this.todayCtrl.valueChanges.pipe(takeUntilDestroyed()).subscribe(isToday => {
            if (isToday) {
                this.valueCtrl.setValue(this.dateAdapter.today());
                this.valueCtrl.disable();
            } else {
                this.valueCtrl.enable();
            }
        });

        merge(this.operatorCtrl.valueChanges, this.valueCtrl.valueChanges, this.todayCtrl.valueChanges)
            .pipe(takeUntilDestroyed())
            .subscribe(() => this.renderedValue.next(this.getRenderedValue()));

        this.initValidators();
        this.reloadCondition(data.condition);
    }

    public getCondition(): FilterGroupConditionField {
        if (!this.valueCtrl.value) {
            return {};
        }

        const condition: FilterGroupConditionField = {};
        let operator = this.operatorCtrl.value;
        let date: string;
        let dayAfter: string;

        if (this.todayCtrl.value) {
            date = 'today';
            dayAfter = 'tomorrow';
        } else {
            date = serialize(this.dateAdapter, this.valueCtrl.value);
            dayAfter = serialize(this.dateAdapter, this.getDayAfter(this.valueCtrl.value));
        }

        if (operator === 'equal') {
            condition.greaterOrEqual = {value: date};
            condition.less = {value: dayAfter};
        } else {
            // Transparently adapt exclusive/inclusive ranges
            if (date !== 'today') {
                if (operator === 'greater') {
                    operator = 'greaterOrEqual';
                    date = dayAfter;
                } else if (operator === 'lessOrEqual') {
                    operator = 'less';
                    date = dayAfter;
                }
            }

            condition[operator] = {value: date};
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
            this.setTodayOrDate(condition.greaterOrEqual.value);

            return;
        }

        for (const operator of this.operators) {
            const reloadedOperator = condition[operator.key];
            if (reloadedOperator) {
                this.operatorCtrl.setValue(operator.key);
                this.setTodayOrDate(reloadedOperator.value);
            }
        }
    }

    private setTodayOrDate(value: Scalar): void {
        if (value === 'today') {
            this.valueCtrl.setValue(this.dateAdapter.today());
            this.todayCtrl.setValue(true);
        } else {
            this.valueCtrl.setValue(this.dateAdapter.deserialize(value));
            this.todayCtrl.setValue(false);
        }
    }

    private initValidators(): void {
        const validators: ValidatorFn[] = [Validators.required];
        if (this.configuration.min) {
            validators.push(dateMin(this.dateAdapter, this.configuration.min));
        }

        if (this.configuration.max) {
            validators.push(dateMax(this.dateAdapter, this.configuration.max));
        }

        this.valueCtrl.setValidators(validators);
    }

    private getDayAfter(date: D): D {
        return this.dateAdapter.addCalendarDays(this.dateAdapter.clone(date), 1);
    }

    private getRenderedValue(): string {
        const operator = this.operators.find(v => v.key === this.operatorCtrl.value);

        let value = '';
        if (this.todayCtrl.value) {
            value = $localize`Aujourd'hui`;
        } else if (this.valueCtrl.value) {
            value = this.dateAdapter.format(this.valueCtrl.value, this.dateFormats.display.dateInput);
        }

        if (operator && value) {
            return operator.label + ' ' + value;
        } else {
            return '';
        }
    }
}
