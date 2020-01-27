import { DateAdapter } from '@angular/material/core';
import { FormControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Get only date, without time and ignoring entirely the timezone
 */
export function serialize<D>(dateAdapter: DateAdapter<D>, value: D | null): string {
    if (!value) {
        return '';
    }

    const y = dateAdapter.getYear(value);
    const m = dateAdapter.getMonth(value) + 1;
    const d = dateAdapter.getDate(value);

    return y
        + '-'
        + (m < 10 ? '0' : '') + m
        + '-'
        + (d < 10 ? '0' : '') + d;
}


/**
 * Min date validator
 */
export function dateMin<D>(dateAdapter: DateAdapter<D>, min: D): ValidatorFn {
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
export  function dateMax<D>(dateAdapter: DateAdapter<D>, max: D): ValidatorFn {
    return (control: FormControl): ValidationErrors | null => {
        if (control.value && dateAdapter.compareDate(control.value, max) > 0) {
            return {max: true};
        }

        return null;
    };
}
