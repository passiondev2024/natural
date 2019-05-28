import { inject, TestBed } from '@angular/core/testing';
import { SwissParsingDateAdapter } from './swiss-parsing-date-adapter.service';

describe('SwissParsingDateAdapter', () => {

    /**
     * Very basic formatting to get only date, without time and without timezone
     */
    function format(date: Date | null): string | null {
        if (!date) {
            return null;
        }

        return date.getFullYear()
            + '-'
            + (date.getMonth() < 9 ? '0' : '') + (date.getMonth() + 1)
            + '-'
            + (date.getDate() < 10 ? '0' : '') + date.getDate();
    }

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [SwissParsingDateAdapter],
        });
    });

    it('should be created', inject([SwissParsingDateAdapter], (adapter: SwissParsingDateAdapter) => {
        expect(adapter).toBeTruthy();
    }));

    it('should parse Swiss format', inject([SwissParsingDateAdapter], (adapter: SwissParsingDateAdapter) => {
        expect(format(adapter.parse('22.11.2018'))).toBe('2018-11-22');
    }));

    it('should parse partial Swiss format', inject([SwissParsingDateAdapter], (adapter: SwissParsingDateAdapter) => {
        expect(format(adapter.parse('2.1.18'))).toMatch('2018-01-02');
    }));

    it('should reject too much partial Swiss format', inject([SwissParsingDateAdapter], (adapter: SwissParsingDateAdapter) => {
        expect(format(adapter.parse('2.1.1'))).toBeNull();
    }));

    it('should reject invalid date', inject([SwissParsingDateAdapter], (adapter: SwissParsingDateAdapter) => {
        expect(format(adapter.parse('00.00.0000'))).toBeNull();
    }));

    it('should not parse invalid format', inject([SwissParsingDateAdapter], (adapter: SwissParsingDateAdapter) => {
        expect(adapter.parse('')).toBeNull();
        expect(adapter.parse(null)).toBeNull();
        expect(adapter.parse('2019-01-01')).toBeNull();
    }));
});
