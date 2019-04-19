import { Pipe, PipeTransform } from '@angular/core';
import { NaturalEnumService } from '../../../services/enum.service';
import { map } from 'rxjs/operators';

/**
 * A pipe to output an enum user-friendly name, instead of its value.
 *
 * Usage would be: {{ element.priority | enum: 'Priority' | async }}
 */
@Pipe({
    name: 'enum',
})
export class NaturalEnumPipe implements PipeTransform {

    // TODO : replace any
    constructor(private  enumService: NaturalEnumService<any>) {
    }

    transform(value: any, enumName: string): any {

        return this.enumService.get(enumName).pipe(map(a => {
            for (const v of a) {
                if (v.value === value) {
                    return v.name;
                }
            }

            return null;
        }));
    }

}
