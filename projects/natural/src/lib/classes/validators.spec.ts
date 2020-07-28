import {deliverableEmail} from '@ecodev/natural';
import {FormControl, ValidatorFn} from '@angular/forms';

function validate(validatorFn: ValidatorFn, expected: boolean, value: any): void {
    const control = new FormControl();
    control.setValidators(validatorFn);
    control.setValue(value);
    expect(control.valid).toBe(expected);
}

describe('simpleEmail', () => {
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
