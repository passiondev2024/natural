import {decimal, deliverableEmail, ifValid, integer, urlValidator} from '@ecodev/natural';
import {FormControl, ValidatorFn, Validators} from '@angular/forms';
import {TestScheduler} from 'rxjs/testing';
import {waitForAsync} from '@angular/core/testing';

function validate(validatorFn: ValidatorFn, expected: boolean, value: any): void {
    const control = new FormControl();
    control.setValidators(validatorFn);
    control.setValue(value);
    expect(control.valid).toBe(expected, JSON.stringify(value) + ' should be ' + (expected ? 'valid' : 'invalid'));
}

describe('deliverableEmail', () => {
    it('should validate email with known TLD', () => {
        validate(deliverableEmail, true, 'john@example.com');
        validate(deliverableEmail, true, 'josé@example.com');
        validate(deliverableEmail, false, 'josé@example.non-existing-tld');
        validate(deliverableEmail, false, 'root@localhost');
        validate(deliverableEmail, false, 'root@127.0.0.1');
        validate(deliverableEmail, true, '');
        validate(deliverableEmail, true, null);

        // Valid https://en.wikipedia.org/wiki/Email_address#Examples
        validate(deliverableEmail, true, 'simple@example.com');
        validate(deliverableEmail, true, 'very.common@example.com');
        validate(deliverableEmail, true, 'disposable.style.email.with+symbol@example.com');
        validate(deliverableEmail, true, 'other.email-with-hyphen@example.com');
        validate(deliverableEmail, true, 'fully-qualified-domain@example.com');

        // may go to user.name@example.com inbox depending on mail server)
        validate(deliverableEmail, true, 'user.name+tag+sorting@example.com');
        validate(deliverableEmail, true, 'x@example.com'); // one-letter local-part)
        validate(deliverableEmail, true, 'example-indeed@strange-example.com');

        // local domain name are specifically rejected (against RFC)
        validate(deliverableEmail, false, 'admin@mailserver1');

        // example TLD are specifically rejected (against RFC)
        validate(deliverableEmail, false, 'example@s.example');

        validate(deliverableEmail, true, '" "@example.org'); // space between the quotes
        validate(deliverableEmail, true, '"john..doe"@example.org'); // quoted double dot
        validate(deliverableEmail, true, 'mailhost!username@example.org'); // bangified host route used for uucp mailers)
        validate(deliverableEmail, true, 'user%example.com@example.org'); // % escaped mail route to user@example.com via example.org

        // https://en.wikipedia.org/wiki/Email_address#Internationalization (corrected for existing TLDs)
        validate(deliverableEmail, true, 'Pelé@example.com');
        validate(deliverableEmail, true, '삼성@삼성.삼성');
        validate(deliverableEmail, true, 'δοκιμή@παράδειγμα.бг');
        validate(deliverableEmail, true, '我買@屋企.香格里拉');
        validate(deliverableEmail, true, '二ノ宮@黒川.ストア');
        validate(deliverableEmail, true, 'медведь@с-балалайкой.онлайн');
        validate(deliverableEmail, true, 'संपर्क@डाटामेल.भारतम्');

        // Invalid https://en.wikipedia.org/wiki/Email_address#Examples
        validate(deliverableEmail, false, 'Abc.example.com'); // no @ character
        validate(deliverableEmail, false, 'A@b@c@example.com'); // only one @ is allowed outside quotation marks
        // none of the special characters in this local-part are allowed outside quotation marks
        validate(deliverableEmail, false, 'a"b(c)d,e:f;g<h>i[j\\k]l@example.com');
        // quoted strings must be dot separated or the only element making up the local-part
        validate(deliverableEmail, false, 'just"not"right@example.com');
        // spaces, quotes, and backslashes may only exist when within quoted strings and preceded by a backslash
        validate(deliverableEmail, false, 'this is"not\\allowed@example.com');
        // even if escaped (preceded by a backslash), spaces, quotes, and backslashes must still be contained by quotes
        validate(deliverableEmail, false, 'this\\ still\\"not\\\\allowed@example.com');

        // we don't care about length of individual parts (against RFC)
        validate(
            deliverableEmail,
            true,
            '1234567890123456789012345678901234567890123456789012345678901234+x@example.com',
        ); // local part is longer than 64 characters)

        // we care about length of entire address (against RFC ?)
        validate(deliverableEmail, false, 'a'.repeat(254) + '@example.com'); // entire address is too long
    });
});

describe('urlValidator', () => {
    it('should validates URL', () => {
        validate(urlValidator, true, 'http://www.example.com');
        validate(urlValidator, true, 'https://www.example.com');
        validate(urlValidator, true, 'http://example.com');
        validate(urlValidator, true, 'http://www.example.com/path');
        validate(urlValidator, true, 'http://www.example.com/path#frag');
        validate(urlValidator, true, 'http://www.example.com/path?param=1');
        validate(urlValidator, true, 'http://www.example.com/path?param=1#fra');
        validate(urlValidator, true, 'http://t.co');
        validate(urlValidator, true, 'http://www.t.co');
        validate(urlValidator, true, 'http://a-b.c.t.co');
        validate(urlValidator, true, 'http://aa.com');
        validate(urlValidator, true, 'http://www.example'); // this is indeed valid because `example` could be a TLD
        validate(urlValidator, true, 'https://example.com:4200/subscribe');
        validate(urlValidator, true, 'https://example-.com'); // this is not conform to rfc1738, but we tolerate it for simplicity sake

        validate(urlValidator, false, 'www.example.com');
        validate(urlValidator, false, 'example.com');
        validate(urlValidator, false, 'www.example');
        validate(urlValidator, false, 'http://example');
        validate(urlValidator, false, 'www.example#.com');
        validate(urlValidator, false, 'www.t.co');
        validate(urlValidator, false, 'file:///C:/folder/file.pdf');
    });
});

describe('integer', () => {
    it('should validates integer number', () => {
        validate(integer, true, null);
        validate(integer, true, undefined);
        validate(integer, true, '');
        validate(integer, true, '0');
        validate(integer, true, '-1');
        validate(integer, true, '1');
        validate(integer, true, '1234567890');
        validate(integer, true, '-1.0');
        validate(integer, true, '1.0');
        validate(integer, true, '0.0');
        validate(integer, true, 0);
        validate(integer, true, -1);
        validate(integer, true, 1);
        validate(integer, true, 1234567890);
        validate(integer, true, -1.0);
        validate(integer, true, 1.0);
        validate(integer, true, 0.0);

        validate(integer, false, 'foo');
        validate(integer, false, '1.2');
        validate(integer, false, '-1.2');
        validate(integer, false, 1.2);
        validate(integer, false, -1.2);
    });
});

describe('decimal', () => {
    describe('with 0 digits', () => {
        it('should validates decimal number', () => {
            const validator = decimal(0);
            validate(validator, true, null);
            validate(validator, true, undefined);
            validate(validator, false, 'foo');
            validate(validator, true, '');
            validate(validator, true, '0');
            validate(validator, true, '0.');
            validate(validator, true, '1');
            validate(validator, true, '1.');
            validate(validator, true, '-0');
            validate(validator, true, '-1');
            validate(validator, false, '-0.0');
            validate(validator, false, '-1.1');
            validate(validator, true, 0);
            validate(validator, true, 1);
            validate(validator, true, -0);
            validate(validator, true, -1);
            validate(validator, true, -0.0);
            validate(validator, false, -1.1);
        });
    });

    describe('with 3 digits', () => {
        it('should validates decimal number', () => {
            const validator = decimal(3);
            validate(validator, true, null);
            validate(validator, true, undefined);
            validate(validator, false, 'foo');
            validate(validator, true, '');
            validate(validator, true, '0');
            validate(validator, true, '0.');
            validate(validator, true, '1');
            validate(validator, true, '1.');
            validate(validator, true, '1.1');
            validate(validator, true, '1.12');
            validate(validator, true, '1.123');
            validate(validator, false, '1.1234');
            validate(validator, true, '-0');
            validate(validator, true, '-1');
            validate(validator, true, '-0.0');
            validate(validator, true, '-1.1');
            validate(validator, true, '-1.12');
            validate(validator, false, '-1.1234');
            validate(validator, true, 0);
            validate(validator, true, 1);
            validate(validator, true, 1.1);
            validate(validator, true, 1.12);
            validate(validator, true, 1.123);
            validate(validator, false, 1.1234);
            validate(validator, true, -0);
            validate(validator, true, -1);
            validate(validator, true, -0.0);
            validate(validator, true, -1.1);
            validate(validator, true, -1.12);
            validate(validator, false, -1.1234);
        });
    });
});

describe('ifValid', () => {
    let scheduler: TestScheduler;

    beforeEach(
        waitForAsync(() => {
            scheduler = new TestScheduler((actual, expected) => {
                expect(actual).toEqual(expected);
            });
        }),
    );

    it('valid form should emit immediately', () => {
        scheduler.run(({expectObservable}) => {
            const control = new FormControl();
            expect(control.status).toBe('VALID');

            const actual = ifValid(control);
            expectObservable(actual).toBe('(a|)', {a: 'VALID'});
        });
    });

    it('invalid form should never emit', () => {
        scheduler.run(({expectObservable}) => {
            const control = new FormControl(null, Validators.required);
            expect(control.status).toBe('INVALID');

            const actual = ifValid(control);
            expectObservable(actual).toBe('|');
        });
    });

    it('valid form should emit after the async validation is completed', () => {
        scheduler.run(({expectObservable, cold}) => {
            const control = new FormControl(null, null, () => {
                // Always valid after a while
                return cold('-(a|)', {a: null});
            });

            expect(control.status).toBe('PENDING');

            control.setValue('foo');
            expect(control.status).toBe('PENDING');

            const actual = ifValid(control);
            expectObservable(actual).toBe('-(a|)', {a: 'VALID'});
        });
    });

    it('invalid form should never emit, even after the async validation is completed', () => {
        scheduler.run(({expectObservable, cold}) => {
            const control = new FormControl(null, null, c => {
                // Simulate error after a while if there is any value
                if (c.value) {
                    return cold('-(a|)', {a: {myError: 'some message'}});
                } else {
                    return cold('-(a|)', {a: null});
                }
            });

            expect(control.status).toBe('PENDING');

            control.setValue('foo');
            expect(control.status).toBe('PENDING');

            const actual = ifValid(control);
            expectObservable(actual).toBe('-|', {a: 'VALID'});
        });
    });
});
