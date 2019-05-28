import { Injectable } from '@angular/core';
import { NativeDateAdapter } from '@angular/material';

@Injectable({
    providedIn: 'root',
})
export class NaturalSwissParsingDateAdapter extends NativeDateAdapter {

    /**
     * Parse commonly accepted swiss format, such as:
     *
     * - 24.12.2018
     * - 1.4.18
     */
    public parse(value: any): Date | null {
        if (typeof value === 'number') {
            return new Date(value);
        }

        if (typeof value === 'string') {
            const m = value.match(/(\d{1,2})\.(\d{1,2})\.(\d{4}|\d{2})/);
            if (m) {
                let year = +m[3];
                const month = +m[2] - 1;
                const date = +m[1];

                if (year < 100) {
                    year += 2000;
                }

                if (month >= 0 && month <= 11 && date >= 1 && date <= 31) {
                    return this.createDate(year, month, date);
                }
            }
        }

        return null;
    }

}
