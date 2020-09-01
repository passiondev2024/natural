import {FormControl} from '@angular/forms';
import {ensureHttpPrefix, urlValidator} from '@ecodev/natural';

function validate(expected: boolean, value: string): void {
    const control = new FormControl();
    control.setValidators(urlValidator);
    control.setValue(value);
    expect(control.valid).toBe(expected, value + ' should be ' + (expected ? 'valid' : 'invalid'));
}

describe('urlValidator', () => {
    it('should validates URL', () => {
        validate(true, 'http://www.example.com');
        validate(true, 'https://www.example.com');
        validate(true, 'http://example.com');
        validate(true, 'http://www.example.com/path');
        validate(true, 'http://www.example.com/path#frag');
        validate(true, 'http://www.example.com/path?param=1');
        validate(true, 'http://www.example.com/path?param=1#fra');
        validate(true, 'http://t.co');
        validate(true, 'http://www.t.co');
        validate(true, 'http://a-b.c.t.co');
        validate(true, 'http://aa.com');
        validate(true, 'http://www.example'); // this is indeed valid because `example` could be a TLD
        validate(true, 'https://example.com:4200/subscribe');
        validate(true, 'https://example-.com'); // this is not conform to rfc1738, but we tolerate it for simplicity sake

        validate(false, 'www.example.com');
        validate(false, 'example.com');
        validate(false, 'www.example');
        validate(false, 'http://example');
        validate(false, 'www.example#.com');
        validate(false, 'www.t.co');
    });
});

describe('ensureHttpPrefix', () => {
    it('should add http prefix', () => {
        expect(ensureHttpPrefix(null)).toBeNull();
        expect(ensureHttpPrefix('')).toEqual('');
        expect(ensureHttpPrefix('h')).toEqual('h');
        expect(ensureHttpPrefix('ht')).toEqual('ht');
        expect(ensureHttpPrefix('htt')).toEqual('htt');
        expect(ensureHttpPrefix('http')).toEqual('http');
        expect(ensureHttpPrefix('https')).toEqual('https');
        expect(ensureHttpPrefix('https:')).toEqual('https:');
        expect(ensureHttpPrefix('https:/')).toEqual('https:/');
        expect(ensureHttpPrefix('https://')).toEqual('https://');
        expect(ensureHttpPrefix('https://ww')).toEqual('https://ww');
        expect(ensureHttpPrefix('https://www.example.com')).toEqual('https://www.example.com');

        expect(ensureHttpPrefix('http')).toEqual('http');
        expect(ensureHttpPrefix('http:')).toEqual('http:');
        expect(ensureHttpPrefix('http:/')).toEqual('http:/');
        expect(ensureHttpPrefix('http://')).toEqual('http://');
        expect(ensureHttpPrefix('http://ww')).toEqual('http://ww');
        expect(ensureHttpPrefix('http://www.example.com')).toEqual('http://www.example.com');

        expect(ensureHttpPrefix('www.example.com')).toEqual('http://www.example.com');
    });
});
