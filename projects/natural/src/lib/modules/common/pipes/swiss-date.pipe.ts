import {Pipe, PipeTransform} from '@angular/core';
import {DatePipe} from '@angular/common';

/**
 * A normal DatePipe but with default formatting to be '12.24.2020 23:30' to match the most common use-cases
 */
@Pipe({
    name: 'swissDate',
})
export class NaturalSwissDatePipe extends DatePipe implements PipeTransform {
    public transform(value: any, format = 'dd.MM.y HH:mm', timezone?: string, locale?: string): string | null {
        return super.transform(value, format, timezone, locale);
    }
}
