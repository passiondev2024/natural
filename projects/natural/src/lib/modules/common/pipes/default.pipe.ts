import {Pipe, PipeTransform} from '@angular/core';

/**
 * Default to given value if variable is `undefined` or `null`.
 *
 * Provides typescripts `??` operator in templates until
 * https://github.com/angular/angular/issues/36528 is solved.
 *
 * Usage:
 *
 *     {{ null | default: 'some fallback value' }}
 */
@Pipe({
    name: 'default',
})
export class NaturalDefaultPipe implements PipeTransform {
    transform<T, K>(value: T, fallbackValue: K): NonNullable<T> | K {
        return value ?? fallbackValue;
    }
}
