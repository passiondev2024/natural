import {Injectable} from '@angular/core';
import {NativeDateAdapter} from '@angular/material/core';

const patterns: readonly RegExp[] = [
    /^(?<day>\d{1,2})\.(?<month>\d{1,2})\.(?<year>\d{4}|\d{2})$/,
    /^(?<day>\d{1,2})-(?<month>\d{1,2})-(?<year>\d{4}|\d{2})$/,
    /^(?<day>\d{1,2})\/(?<month>\d{1,2})\/(?<year>\d{4}|\d{2})$/,
    /^(?<day>\d{1,2})\\(?<month>\d{1,2})\\(?<year>\d{4}|\d{2})$/,
    // strict ISO format
    /^(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})$/,
];

@Injectable({
    providedIn: 'root',
})
export class NaturalSwissParsingDateAdapter extends NativeDateAdapter {
    /**
     * Parse commonly accepted swiss format, such as:
     *
     * - 24.12.2018
     * - 1.4.18
     * - 2018-12-24
     */
    public parse(value: unknown): Date | null {
        if (typeof value === 'number') {
            return new Date(value);
        }

        if (typeof value === 'string') {
            const trimmed = value.trim();

            for (const pattern of patterns) {
                const m = trimmed.match(pattern);
                if (m?.groups) {
                    const year = +m.groups.year;
                    const month = +m.groups.month;
                    const day = +m.groups.day;

                    return this.createDateIfValid(year, month, day);
                }
            }
        }

        return null;
    }

    private createDateIfValid(year: number, month: number, date: number): Date | null {
        // Assume year 2000 if only two digits
        if (year < 100) {
            year += 2000;
        }

        month = month - 1;
        if (month >= 0 && month <= 11 && date >= 1 && date <= 31) {
            return this.createDate(year, month, date);
        }

        return null;
    }

    public getFirstDayOfWeek(): number {
        // Always starts on Monday, even though it is not true for Canada, U.S., Mexico and many more
        // Also see https://github.com/tc39/ecma402/issues/6
        return 1;
    }
}
