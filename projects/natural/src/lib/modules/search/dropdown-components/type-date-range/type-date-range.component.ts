import { Component, Inject } from '@angular/core';
import {
    FormControl,
    FormGroup,
    FormGroupDirective,
    NgForm,
    ValidatorFn,
    Validators,
    ValidationErrors,
    AbstractControl,
} from '@angular/forms';
import { TypeDateRangeConfiguration } from './TypeDateRangeConfiguration';
import { ErrorStateMatcher, DateAdapter, MAT_DATE_FORMATS, MatDateFormats } from '@angular/material';
import { DropdownComponent } from '../../types/DropdownComponent';
import { FilterGroupConditionField } from '../../classes/graphql-doctrine.types';
import { BehaviorSubject } from 'rxjs';
import { NATURAL_DROPDOWN_DATA, NaturalDropdownData } from '../../dropdown-container/dropdown.service';

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
 * At least one value set
 */
function atLeastOneValue(): ValidatorFn {
    return (control: FormControl): ValidationErrors | null => {
        const from = parseFromControl(control, 'from');
        const to = parseFromControl(control, 'to');

        if (!from && !to) {
            return {required: true};
        }

        return null;
    };
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
    templateUrl: './type-date-range.component.html',
})
export class TypeDateRangeComponent<D = any> implements DropdownComponent {

    public renderedValue = new BehaviorSubject<string>('');
    public configuration: TypeDateRangeConfiguration<D>;
    public matcher = new InvalidWithValueStateMatcher();

    public form: FormGroup = new FormGroup({
        from: new FormControl(),
        to: new FormControl(),
    });

    private readonly defaults: TypeDateRangeConfiguration<D> = {
        min: null,
        max: null,
        fromRequired: false,
        toRequired: false,
    };

    constructor(
        @Inject(NATURAL_DROPDOWN_DATA) data: NaturalDropdownData,
        private dateAdapter: DateAdapter<D>,
        @Inject(MAT_DATE_FORMATS) private dateFormats: MatDateFormats,
    ) {
        this.configuration = {...this.defaults, ...data.configuration as TypeDateRangeConfiguration};

        this.form.valueChanges.subscribe(() => {
            this.renderedValue.next(this.getRenderedValue());
        });

        this.initValidators();
        this.reloadCondition(data.condition);
    }

    private reloadCondition(condition: FilterGroupConditionField | null): void {
        if (!condition) {
            return;
        }

        const value = {
            from: <D | null> null,
            to: <D | null> null,
        };

        if (condition.between) {
            value.from = this.dateAdapter.parse(condition.between.from, null);
            value.to = this.dateAdapter.parse(condition.between.to, null);
        } else if (condition.greaterOrEqual) {
            value.from = this.dateAdapter.parse(condition.greaterOrEqual.value, null);
        } else if (condition.lessOrEqual) {
            value.to = this.dateAdapter.parse(condition.lessOrEqual.value, null);
        }

        this.form.setValue(value);
    }

    private initValidators(): void {
        const rangeValidators: ValidatorFn[] = [];
        if (this.configuration.min) {
            rangeValidators.push(dateMin<D>(this.dateAdapter, this.configuration.min));
        }

        if (this.configuration.max) {
            rangeValidators.push(dateMax<D>(this.dateAdapter, this.configuration.max));
        }

        let fromValidators = rangeValidators;
        let toValidators = rangeValidators;

        if (this.configuration.fromRequired) {
            fromValidators = [Validators.required].concat(fromValidators);
        }
        if (this.configuration.toRequired) {
            toValidators = [Validators.required].concat(toValidators);
        }

        this.getFrom().setValidators(fromValidators);
        this.getTo().setValidators(toValidators);

        this.form.setValidators([
            atLeastOneValue(),
            toGreaterThanFrom<D>(this.dateAdapter), // From < To
        ]);
    }

    public getCondition(): FilterGroupConditionField {
        const from = this.serialize(this.getFrom().value);
        const to = this.serialize(this.getTo().value);

        if (from && to) {
            return {between: {from, to}};
        } else if (from) {
            return {greaterOrEqual: {value: from}};
        } else if (to) {
            return {lessOrEqual: {value: to}};
        } else {
            return {};
        }
    }

    private serialize(value: D | null): string {
        return value ? this.dateAdapter.toIso8601(value) : '';
    }

    public render(value: D | null): string {
        return value ? this.dateAdapter.format(value, this.dateFormats.display.dateInput) : '';
    }

    public getFrom(): AbstractControl {
        return this.form.get('from') as AbstractControl;
    }

    public getTo(): AbstractControl {
        return this.form.get('to') as AbstractControl;
    }

    private getRenderedValue(): string {
        const from = this.render(this.getFrom().value);
        const to = this.render(this.getTo().value);

        if (from && to) {
            return from + ' - ' + to;
        } else if (from) {
            return '≥ ' + from;
        } else if (to) {
            return '≤ ' + to;
        } else {
            return '';
        }
    }

    public isValid(): boolean {
        return this.form.valid;
    }

    public isDirty(): boolean {
        return this.form.dirty;
    }

}
