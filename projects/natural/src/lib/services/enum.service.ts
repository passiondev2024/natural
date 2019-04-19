import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
// import { enumTypeQuery } from '../../shared/queries/enum';

export interface IEnum {
    value: string;
    name: string;
}

@Injectable({
    providedIn: 'root',
})
export class NaturalEnumService<EnumType> {

    constructor(private apollo: Apollo) {
    }

    /**
     * Return a list of observable enumerables considering the given name
     */
    public get(name: string): Observable<IEnum[]> {

        return of([]);

        // Load possible action statuses
        // return this.apollo.query<EnumType>({
        //     query: enumTypeQuery, // TODO : this is missing ! find a way to provide
        //     variables: {name: name},
        //     fetchPolicy: 'cache-first',
        // }).pipe(map(result => {
        //     const values: IEnum[] = [];
        //     if (result.data.__type && result.data.__type.enumValues) {
        //         for (const enumValue of result.data.__type.enumValues) {
        //             values.push({
        //                 value: enumValue.name,
        //                 name: enumValue.description || '',
        //             });
        //         }
        //     }
        //     return values;
        // }));
    }

}
