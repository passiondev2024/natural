import {Directive, HostListener, Input} from '@angular/core';
import {AbstractControl} from '@angular/forms';

/**
 * Need to add http:// prefix if we don't have prefix already AND we don't have part of it
 */
export function ensureHttpPrefix(value: string | null): string | null {
    if (!value) {
        return value;
    }

    const completePrefix = /^(https?):\/\//i.test(value);
    const startingPrefix = 'https://'.indexOf(value) === 0 || 'http://'.indexOf(value) === 0;

    if (!completePrefix && !startingPrefix) {
        return 'http://' + value;
    } else {
        return value;
    }
}

/**
 * This directive only supports ReactiveForms due to ngModel/ngControl encapsulation and changes emissions.
 */
@Directive({
    selector: '[naturalHttpPrefix]',
    standalone: true,
})
export class NaturalHttpPrefixDirective {
    @Input() public naturalHttpPrefix: AbstractControl | null = null;

    @HostListener('ngModelChange', ['$event'])
    public httpize($event: string): void {
        if (this.naturalHttpPrefix) {
            const newValue = ensureHttpPrefix($event) || $event;
            if ($event !== newValue) {
                this.naturalHttpPrefix.setValue(newValue);
            }
        }
    }
}
