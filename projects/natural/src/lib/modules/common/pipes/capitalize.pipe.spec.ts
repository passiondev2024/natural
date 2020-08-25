import {NaturalCapitalizePipe} from './capitalize.pipe';

describe('NaturalCapitalizePipe', () => {
    it('create an instance', () => {
        const pipe = new NaturalCapitalizePipe();
        expect(pipe).toBeTruthy();
    });

    it('capitalize a string', () => {
        const pipe = new NaturalCapitalizePipe();
        expect(pipe.transform('foo bar')).toBe('Foo bar');
    });

    it('no effect on capitalized string', () => {
        const pipe = new NaturalCapitalizePipe();
        expect(pipe.transform('Foo bar')).toBe('Foo bar');
    });

    it('do not crash with null', () => {
        const pipe = new NaturalCapitalizePipe();
        expect(pipe.transform(null)).toBeNull();
    });
});
