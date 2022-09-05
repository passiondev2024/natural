import {Apollo} from 'apollo-angular';
import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {PaginatedData} from '../classes/data-source';
import {NaturalQueryVariablesManager, QueryVariables} from '../classes/query-variable-manager';
import {delay} from 'rxjs/operators';
import {ItemService, Item} from './item.service';
import {NaturalDebounceService} from '../services/debounce.service';

/**
 * A service that has no items
 */
@Injectable({
    providedIn: 'root',
})
export class NoResultService extends ItemService {
    public constructor(apollo: Apollo, naturalDebounceService: NaturalDebounceService) {
        super(apollo, naturalDebounceService);
    }

    public watchAll(
        queryVariablesManager: NaturalQueryVariablesManager<QueryVariables>,
    ): Observable<PaginatedData<Item>> {
        return of({
            items: [],
            length: 0,
            pageIndex: 0,
            pageSize: 5,
        }).pipe(delay(500));
    }

    public getAll(queryVariablesManager: NaturalQueryVariablesManager): Observable<PaginatedData<Item>> {
        return of({
            items: [],
            length: 0,
            pageIndex: 0,
            pageSize: 5,
        }).pipe(delay(500));
    }

    public count(queryVariablesManager: unknown): Observable<number> {
        return of(0).pipe(delay(500));
    }
}
