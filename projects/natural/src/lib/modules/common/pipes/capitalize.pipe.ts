import { Pipe, PipeTransform } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { NaturalUtility } from '../../../classes/utility';

@Pipe({name: 'capitalize'})
export class NaturalCapitalizePipe implements PipeTransform {

    public transform(value: string | null | Observable<string | null>): string | null | Observable<string | null> {

        if (value instanceof Observable) {
            return value.pipe(map(val => this.getValue(val)));
        } else {
            return this.getValue(value);
        }

    }

    private getValue(value: string | null): string | null {
        if (value) {
            return NaturalUtility.upperCaseFirstLetter(value);
        }
        return value;
    }
}
