import { Injectable } from '@angular/core';
import { NativeDateAdapter } from '@angular/material/core';

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
    public parse(value: any): Date | null {
        if (typeof value === 'number') {
            return new Date(value);
        }

        if (typeof value === 'string') {
            let m = value.match(/(\d{1,2})\.(\d{1,2})\.(\d{4}|\d{2})/);
            if (m) {
                let year = +m[3];

                // Assume year 2000 if only two digits
                if (year < 100) {
                    year += 2000;
                }

                return this.createDateIfValid(year, +m[2], +m[1]);
            }

            // Attempt strict ISO format
            m = value.match(/(\d{4})-(\d{2})-(\d{2})/);
            if (m) {
                return this.createDateIfValid(+m[1], +m[2], +m[3]);
            }
        }

        return null;
    }

    private createDateIfValid(year: number, month: number, date: number): Date | null {
        month = month - 1;
        if (month >= 0 && month <= 11 && date >= 1 && date <= 31) {
            return this.createDate(year, month, date);
        }

        return null;
    }

}
