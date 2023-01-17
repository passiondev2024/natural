import {Apollo} from 'apollo-angular';
import {Injectable} from '@angular/core';

import {Observable, timer} from 'rxjs';
import {PaginatedData} from '../classes/data-source';
import {QueryVariables} from '../classes/query-variable-manager';
import {NaturalAbstractModelService} from '../services/abstract-model.service';
import {map} from 'rxjs/operators';
import {Item} from './item.service';
import {NaturalDebounceService} from '../services/debounce.service';

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
    public constructor(apollo: Apollo, naturalDebounceService: NaturalDebounceService) {
        super(apollo, naturalDebounceService, 'user', null, null, null, null, null);
    }

    public watchAll(): Observable<PaginatedData<Item>> {
        return error('watchAll');
    }

    public getAll(): Observable<PaginatedData<Item>> {
        return error('getAll');
    }

    public getOne(): Observable<Item> {
        return error('getOne');
    }

    public count(): Observable<number> {
        return error('count');
    }
}
