import {Apollo} from 'apollo-angular';
import {Injectable} from '@angular/core';

import {Observable, timer} from 'rxjs';
import {PaginatedData} from '../classes/data-source';
import {NaturalQueryVariablesManager, QueryVariables} from '../classes/query-variable-manager';
import {NaturalAbstractModelService} from '../services/abstract-model.service';
import {map} from 'rxjs/operators';
import {Item} from './any.service';

function error(method: string): Observable<any> {
    return timer(1000).pipe(
        map(() => {
            throw new Error('ErrorService.' + method + ' error');
        }),
    );
}

@Injectable({
    providedIn: 'root',
})
export class ErrorService extends NaturalAbstractModelService<
    Item,
    {id: string},
    PaginatedData<Item>,
    QueryVariables,
    never,
    never,
    Record<string, never>,
    never,
    never,
    never
> {
    public constructor(apollo: Apollo) {
        super(apollo, 'user', null, null, null, null, null);
    }

    public watchAll(
        queryVariablesManager: NaturalQueryVariablesManager<QueryVariables>,
    ): Observable<PaginatedData<Item>> {
        return error('watchAll');
    }

    public getAll(
        queryVariablesManager: NaturalQueryVariablesManager<QueryVariables>,
    ): Observable<PaginatedData<Item>> {
        return error('getAll');
    }

    public getOne(id: string): Observable<Item> {
        return error('getOne');
    }

    public count(queryVariablesManager: unknown): Observable<number> {
        return error('count');
    }
}
