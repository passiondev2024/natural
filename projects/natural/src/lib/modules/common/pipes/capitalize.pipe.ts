import {Pipe, PipeTransform} from '@angular/core';
import {upperCaseFirstLetter} from '../../../classes/utility';

@Pipe({name: 'capitalize'})
export class NaturalCapitalizePipe implements PipeTransform {
    public transform(value: string | null): string | null {
        if (value) {
            return upperCaseFirstLetter(value);
        }

        return value;
    }
}
