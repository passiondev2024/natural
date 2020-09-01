import {deliverableEmail, ensureHttpPrefix, urlValidator} from '@ecodev/natural';
import {FormControl, ValidatorFn} from '@angular/forms';

function validateUrl(expected: boolean, value: string): void {
    const control = new FormControl();
    control.setValidators(urlValidator);
    control.setValue(value);
    expect(control.valid).toBe(expected, value + ' should be ' + (expected ? 'valid' : 'invalid'));
}

function validateEmail(validatorFn: ValidatorFn, expected: boolean, value: any): void {
    const control = new FormControl();
    control.setValidators(validatorFn);
    control.setValue(value);
    expect(control.valid).toBe(expected);
}

describe('simpleEmail', () => {
    it('should validate email with known TLD', () => {
        validateEmail(deliverableEmail, true, 'john@example.com');
        validateEmail(deliverableEmail, true, 'josé@example.com');
        validateEmail(deliverableEmail, false, 'josé@example.non-existing-tld');
        validateEmail(deliverableEmail, false, 'root@localhost');
        validateEmail(deliverableEmail, false, 'root@127.0.0.1');
        validateEmail(deliverableEmail, true, '');
        validateEmail(deliverableEmail, true, null);

        // Valid https://en.wikipedia.org/wiki/Email_address#Examples
        validateEmail(deliverableEmail, true, 'simple@example.com');
        validateEmail(deliverableEmail, true, 'very.common@example.com');
        validateEmail(deliverableEmail, true, 'disposable.style.email.with+symbol@example.com');
        validateEmail(deliverableEmail, true, 'other.email-with-hyphen@example.com');
        validateEmail(deliverableEmail, true, 'fully-qualified-domain@example.com');

        // may go to user.name@example.com inbox depending on mail server)
        validateEmail(deliverableEmail, true, 'user.name+tag+sorting@example.com');
        validateEmail(deliverableEmail, true, 'x@example.com'); // one-letter local-part)
        validateEmail(deliverableEmail, true, 'example-indeed@strange-example.com');

        // local domain name are specifically rejected (against RFC)
        validateEmail(deliverableEmail, false, 'admin@mailserver1');

        // example TLD are specifically rejected (against RFC)
        validateEmail(deliverableEmail, false, 'example@s.example');

        validateEmail(deliverableEmail, true, '" "@example.org'); // space between the quotes
        validateEmail(deliverableEmail, true, '"john..doe"@example.org'); // quoted double dot
        validateEmail(deliverableEmail, true, 'mailhost!username@example.org'); // bangified host route used for uucp mailers)
        validateEmail(deliverableEmail, true, 'user%example.com@example.org'); // % escaped mail route to user@example.com via example.org

        // https://en.wikipedia.org/wiki/Email_address#Internationalization (corrected for existing TLDs)
        validateEmail(deliverableEmail, true, 'Pelé@example.com');
        validateEmail(deliverableEmail, true, '삼성@삼성.삼성');
        validateEmail(deliverableEmail, true, 'δοκιμή@παράδειγμα.бг');
        validateEmail(deliverableEmail, true, '我買@屋企.香格里拉');
        validateEmail(deliverableEmail, true, '二ノ宮@黒川.ストア');
        validateEmail(deliverableEmail, true, 'медведь@с-балалайкой.онлайн');
        validateEmail(deliverableEmail, true, 'संपर्क@डाटामेल.भारतम्');

        // Invalid https://en.wikipedia.org/wiki/Email_address#Examples
        validateEmail(deliverableEmail, false, 'Abc.example.com'); // no @ character
        validateEmail(deliverableEmail, false, 'A@b@c@example.com'); // only one @ is allowed outside quotation marks
        // none of the special characters in this local-part are allowed outside quotation marks
        validateEmail(deliverableEmail, false, 'a"b(c)d,e:f;g<h>i[j\\k]l@example.com');
        // quoted strings must be dot separated or the only element making up the local-part
        validateEmail(deliverableEmail, false, 'just"not"right@example.com');
        // spaces, quotes, and backslashes may only exist when within quoted strings and preceded by a backslash
        validateEmail(deliverableEmail, false, 'this is"not\\allowed@example.com');
        // even if escaped (preceded by a backslash), spaces, quotes, and backslashes must still be contained by quotes
        validateEmail(deliverableEmail, false, 'this\\ still\\"not\\\\allowed@example.com');

        // we don't care about length of individual parts (against RFC)
        validateEmail(
            deliverableEmail,
            true,
            '1234567890123456789012345678901234567890123456789012345678901234+x@example.com',
        ); // local part is longer than 64 characters)

        // we care about length of entire address (against RFC ?)
        validateEmail(deliverableEmail, false, 'a'.repeat(254) + '@example.com'); // entire address is too long
    });
});

describe('urlValidator', () => {
    it('should validates URL', () => {
        validateUrl(true, 'http://www.example.com');
        validateUrl(true, 'https://www.example.com');
        validateUrl(true, 'http://example.com');
        validateUrl(true, 'http://www.example.com/path');
        validateUrl(true, 'http://www.example.com/path#frag');
        validateUrl(true, 'http://www.example.com/path?param=1');
        validateUrl(true, 'http://www.example.com/path?param=1#fra');
        validateUrl(true, 'http://t.co');
        validateUrl(true, 'http://www.t.co');
        validateUrl(true, 'http://a-b.c.t.co');
        validateUrl(true, 'http://aa.com');
        validateUrl(true, 'http://www.example'); // this is indeed valid because `example` could be a TLD
        validateUrl(true, 'https://example.com:4200/subscribe');
        validateUrl(true, 'https://example-.com'); // this is not conform to rfc1738, but we tolerate it for simplicity sake

        validateUrl(false, 'www.example.com');
        validateUrl(false, 'example.com');
        validateUrl(false, 'www.example');
        validateUrl(false, 'http://example');
        validateUrl(false, 'www.example#.com');
        validateUrl(false, 'www.t.co');
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
