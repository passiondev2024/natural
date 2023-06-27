import {Pipe, PipeTransform} from '@angular/core';
import {upperCaseFirstLetter} from '../../../classes/utility';

/**
 * Returns the string with the first letter as capital
 */
@Pipe({
    name: 'capitalize',
    standalone: true,
})
export class NaturalCapitalizePipe implements PipeTransform {
    public transform(value: string | null): string | null {
        if (value) {
            return upperCaseFirstLetter(value);
        }

        return value;
    }
}
