import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, of, timer } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { NaturalAbstractModelService } from '../services/abstract-model.service';
import { NaturalQueryVariablesManager, QueryVariables } from './query-variable-manager';

/**
 * Returns an async validator function that checks that the form control value is unique
 */
export function unique(
    fieldName: string,
    excludedId: string | null | undefined,
    modelService: NaturalAbstractModelService<any, any, any, any, any, any, any, any, any>,
): AsyncValidatorFn {

    return (control: AbstractControl): Observable<ValidationErrors | null> => {

        if (!control.value || !control.dirty) {
            return of(null);
        }

        const condition = {};
        condition[fieldName] = {equal: {value: control.value}};

        if (excludedId) {
            condition['id'] = {equal: {value: excludedId, not: true}};
        }

        const variables: QueryVariables = {
            pagination: {pageIndex: 0, pageSize: 0},
            filter: {groups: [{conditions: [condition]}]},
        };

        const qvm = new NaturalQueryVariablesManager();
        qvm.set('variables', variables);

        return timer(500).pipe(switchMap(() => modelService.count(qvm).pipe(
            map(count => count > 0 ? {duplicateValue: count} : null),
        )));
    };
}
