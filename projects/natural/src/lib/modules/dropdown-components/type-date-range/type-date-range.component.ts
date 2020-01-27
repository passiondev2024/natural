import { Component, Inject } from '@angular/core';
import {
    FormControl,
    FormGroup,
    FormGroupDirective,
    NgForm,
    ValidatorFn,
    Validators,
    ValidationErrors,
} from '@angular/forms';
import { ErrorStateMatcher, DateAdapter, MAT_DATE_FORMATS, MatDateFormats } from '@angular/material';
import { BehaviorSubject, merge } from 'rxjs';
import { DropdownComponent } from '../../search/types/dropdown-component';
import { NaturalDropdownData, NATURAL_DROPDOWN_DATA } from '../../search/dropdown-container/dropdown.service';
import { FilterGroupConditionField } from '../../search/classes/graphql-doctrine.types';
import { dateMax, dateMin, serialize } from '../utils';

export interface TypeDateRangeConfiguration<D = any> {
    min?: D | null;
    max?: D | null;
}

export class InvalidWithValueStateMatcher implements ErrorStateMatcher {
    isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
        return form && form.invalid && (form.value.to || form.value.from) || control && control.invalid;
    }
}

function parseFromControl<D>(control: FormControl, key: string): D | null {
    const c = control.get(key);
    if (!c) {
        return null;
    }

    return c.value;
}

/**
 * From >= To
 */
function toGreaterThanFrom<D>(dateAdapter: DateAdapter<D>): ValidatorFn {
    return (control: FormControl): ValidationErrors | null => {
        const from = parseFromControl<D>(control, 'from');
        const to = parseFromControl<D>(control, 'to');

        if (from && to && dateAdapter.compareDate(from, to) > 0) {
            return {toGreaterThanFrom: true};
        }

        return null;
    };
}

/**
 * Date range with mandatory bounding dates.
 *
 * If you need ooptional bounding date, then use `TypeDateComponent` instead.
 */
@Component({
    templateUrl: './type-date-range.component.html',
})
export class TypeDateRangeComponent<D = any> implements DropdownComponent {

    public renderedValue = new BehaviorSubject<string>('');
    public configuration: TypeDateRangeConfiguration<D>;
    public matcher = new InvalidWithValueStateMatcher();
    public fromCtrl = new FormControl();
    public toCtrl = new FormControl();
    public form: FormGroup;

    private readonly defaults: TypeDateRangeConfiguration<D> = {
        min: null,
        max: null,
    };

    constructor(
        @Inject(NATURAL_DROPDOWN_DATA) data: NaturalDropdownData<TypeDateRangeConfiguration<D>>,
        private dateAdapter: DateAdapter<D>,
        @Inject(MAT_DATE_FORMATS) private dateFormats: MatDateFormats,
    ) {
        this.configuration = {...this.defaults, ...data.configuration};
        this.form = new FormGroup({
            from: this.fromCtrl,
            to: this.toCtrl,
        });

        merge(this.fromCtrl.valueChanges, this.toCtrl.valueChanges).subscribe(() => {
            this.renderedValue.next(this.getRenderedValue());
        });

        this.initValidators();
        this.reloadCondition(data.condition);
    }

    public getCondition(): FilterGroupConditionField {
        const from = serialize<D>(this.dateAdapter, this.fromCtrl.value);
        const to = serialize<D>(this.dateAdapter, this.toCtrl.value);

        if (from && to) {
            return {between: {from, to}};
        } else {
            return {};
        }
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

        const value = {
            from: null as D | null,
            to: null as D | null,
        };

        if (condition.between) {
            value.from = this.dateAdapter.parse(condition.between.from, null);
            value.to = this.dateAdapter.parse(condition.between.to, null);
        }

        this.form.setValue(value);
    }

    private initValidators(): void {
        const validators: ValidatorFn[] = [Validators.required];
        if (this.configuration.min) {
            validators.push(dateMin<D>(this.dateAdapter, this.configuration.min));
        }

        if (this.configuration.max) {
            validators.push(dateMax<D>(this.dateAdapter, this.configuration.max));
        }

        this.fromCtrl.setValidators(validators);
        this.toCtrl.setValidators(validators);

        this.form.setValidators([
            toGreaterThanFrom<D>(this.dateAdapter), // From < To
        ]);
    }

    public render(value: D | null): string {
        return value ? this.dateAdapter.format(value, this.dateFormats.display.dateInput) : '';
    }

    private getRenderedValue(): string {
        const from = this.render(this.fromCtrl.value);
        const to = this.render(this.toCtrl.value);

        if (from && to) {
            return from + ' - ' + to;
        } else {
            return '';
        }
    }
}
