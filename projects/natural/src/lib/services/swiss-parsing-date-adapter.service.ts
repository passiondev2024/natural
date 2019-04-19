import { Injectable } from '@angular/core';
import { NativeDateAdapter } from '@angular/material';

@Injectable({
    providedIn: 'root',
})
export class SwissParsingDateAdapter extends NativeDateAdapter {

    public parse(value: any): Date | null {
        if (typeof value === 'number') {
            return new Date(value);
        }

        if (typeof value === 'string') {
            let m = value.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
            if (m) {
                return this.createDate(+m[3], +m[2] - 1, +m[1]);
            }

            m = value.match(/(\d{1,2})\.(\d{1,2})\.(\d{2})/);
            if (m) {
                return this.createDate(+('20' + m[3]), +m[2] - 1, +m[1]);
            }
        }

        return null;
    }

}
