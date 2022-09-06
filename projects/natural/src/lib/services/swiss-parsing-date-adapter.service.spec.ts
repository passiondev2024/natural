import {TestBed} from '@angular/core/testing';
import {formatIsoDate} from '../classes/utility';
import {NaturalSwissParsingDateAdapter} from './swiss-parsing-date-adapter.service';

describe('NaturalSwissParsingDateAdapter', () => {
    let adapter: NaturalSwissParsingDateAdapter;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [NaturalSwissParsingDateAdapter],
        });
        adapter = TestBed.inject(NaturalSwissParsingDateAdapter);
    });

    it('should be created', () => {
        expect(adapter).toBeTruthy();
    });

    it('should parse Swiss format', () => {
        expect(formatIsoDate(adapter.parse('22.11.2018'))).toBe('2018-11-22');
    });

    it('should parse with slash format', () => {
        expect(formatIsoDate(adapter.parse('22/11/2018'))).toBe('2018-11-22');
    });

    it('should parse with backslash format', () => {
        expect(formatIsoDate(adapter.parse('22\\11\\2018'))).toBe('2018-11-22');
    });

    it('should parse with dash format', () => {
        expect(formatIsoDate(adapter.parse('22-11-2018'))).toBe('2018-11-22');
    });

    it('should parse partial Swiss format', () => {
        expect(formatIsoDate(adapter.parse('2.1.18'))).toBe('2018-01-02');
    });

    it('should parse partial with dash format', () => {
        expect(formatIsoDate(adapter.parse('2-1-18'))).toBe('2018-01-02');
    });

    it('should parse ISO format', () => {
        expect(formatIsoDate(adapter.parse('2018-01-02'))).toBe('2018-01-02');
    });

    it('should tolerate whitespaces before and after', () => {
        expect(formatIsoDate(adapter.parse('  22.11.2018  '))).toBe('2018-11-22');
        expect(formatIsoDate(adapter.parse('  2018-01-02  '))).toBe('2018-01-02');
    });

    it('should reject too much partial Swiss format', () => {
        expect(formatIsoDate(adapter.parse('2.1.1'))).toBeNull();
    });

    it('should reject mixed separators', () => {
        expect(adapter.parse('22.11/2018')).toBeNull();
    });

    it('should reject no separator at all', () => {
        expect(adapter.parse('220905')).toBeNull();
    });

    it('should reject invalid date', () => {
        expect(adapter.parse('00.01.2000')).toBeNull();
        expect(adapter.parse('01.00.2000')).toBeNull();
        expect(adapter.parse('01.31.2000')).toBeNull();
        expect(adapter.parse('50.01.2000')).toBeNull();
    });

    it('should not parse invalid format', () => {
        expect(adapter.parse('')).toBeNull();
        expect(adapter.parse(null)).toBeNull();
    });
});
