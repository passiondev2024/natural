import {inject, TestBed} from '@angular/core/testing';
import {formatIsoDate} from '../classes/utility';
import {NaturalSwissParsingDateAdapter} from './swiss-parsing-date-adapter.service';

describe('NaturalSwissParsingDateAdapter', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [NaturalSwissParsingDateAdapter],
        });
    });

    it('should be created', inject([NaturalSwissParsingDateAdapter], (adapter: NaturalSwissParsingDateAdapter) => {
        expect(adapter).toBeTruthy();
    }));

    it('should parse Swiss format', inject(
        [NaturalSwissParsingDateAdapter],
        (adapter: NaturalSwissParsingDateAdapter) => {
            expect(formatIsoDate(adapter.parse('22.11.2018'))).toBe('2018-11-22');
        },
    ));

    it('should parse partial Swiss format', inject(
        [NaturalSwissParsingDateAdapter],
        (adapter: NaturalSwissParsingDateAdapter) => {
            expect(formatIsoDate(adapter.parse('2.1.18'))).toMatch('2018-01-02');
        },
    ));

    it('should parse ISO format', inject(
        [NaturalSwissParsingDateAdapter],
        (adapter: NaturalSwissParsingDateAdapter) => {
            expect(formatIsoDate(adapter.parse('2018-01-02'))).toMatch('2018-01-02');
        },
    ));

    it('should reject too much partial Swiss format', inject(
        [NaturalSwissParsingDateAdapter],
        (adapter: NaturalSwissParsingDateAdapter) => {
            expect(formatIsoDate(adapter.parse('2.1.1'))).toBeNull();
        },
    ));

    it('should reject invalid date', inject(
        [NaturalSwissParsingDateAdapter],
        (adapter: NaturalSwissParsingDateAdapter) => {
            expect(formatIsoDate(adapter.parse('00.00.0000'))).toBeNull();
        },
    ));

    it('should not parse invalid format', inject(
        [NaturalSwissParsingDateAdapter],
        (adapter: NaturalSwissParsingDateAdapter) => {
            expect(adapter.parse('')).toBeNull();
            expect(adapter.parse(null)).toBeNull();
        },
    ));
});
