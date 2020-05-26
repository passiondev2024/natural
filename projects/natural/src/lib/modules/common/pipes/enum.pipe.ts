import {Pipe, PipeTransform} from '@angular/core';
import {map} from 'rxjs/operators';
import {NaturalEnumService} from '../../../services/enum.service';
import {Observable} from 'rxjs';

/**
 * A pipe to output an enum user-friendly name, instead of its value.
 *
 * Usage would be: {{ element.priority | enum: 'Priority' | async }}
 */
@Pipe({
    name: 'enum',
})
export class NaturalEnumPipe implements PipeTransform {
    constructor(private enumService: NaturalEnumService) {}

    transform(value: any, enumName: string): Observable<string | null> {
        return this.enumService.get(enumName).pipe(
            map(a => {
                for (const v of a) {
                    if (v.value === value) {
                        return v.name;
                    }
                }

                return null;
            }),
        );
    }
}
