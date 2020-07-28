import {Pipe, PipeTransform} from '@angular/core';
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

    public transform(value: any, enumName: string): Observable<string | null> {
        return this.enumService.getValueName(value, enumName);
    }
}
