import {NaturalDefaultPipe} from './default.pipe';

describe('NaturalDefaultPipe', () => {
    it('create an instance', () => {
        const pipe = new NaturalDefaultPipe();
        expect(pipe).toBeTruthy();
    });

    it('string return string', () => {
        const pipe = new NaturalDefaultPipe();
        expect(pipe.transform('foo bar', 'default value')).toBe('foo bar');
    });

    it('false return false', () => {
        const pipe = new NaturalDefaultPipe();
        expect(pipe.transform(false, 'default value')).toBe(false);
    });

    it('undefined return default', () => {
        const pipe = new NaturalDefaultPipe();
        expect(pipe.transform(undefined, 'default value')).toBe('default value');
    });

    it('null return default', () => {
        const pipe = new NaturalDefaultPipe();
        expect(pipe.transform(null, 'default value')).toBe('default value');
    });
});
