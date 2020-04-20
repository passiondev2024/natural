import { NaturalSwissDatePipe } from './swiss-date.pipe';

describe('NaturalSwissDatePipe', () => {
    it('create an instance', () => {
        const pipe = new NaturalSwissDatePipe('en-US');
        expect(pipe).toBeTruthy();
    });

    it('default format is swiss one', () => {
        const pipe = new NaturalSwissDatePipe('en-US');
        expect(pipe.transform(new Date('2020-12-24T23:30:55'))).toBe('24.12.2020 23:30');
    });
});
