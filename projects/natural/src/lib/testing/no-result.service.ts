import {Apollo} from 'apollo-angular';
import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {PaginatedData} from '../classes/data-source';
import {delay} from 'rxjs/operators';
import {Item, ItemService} from './item.service';
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

    public override watchAll(): Observable<PaginatedData<Item>> {
        return of({
            items: [],
            length: 0,
            pageIndex: 0,
            pageSize: 5,
        }).pipe(delay(500));
    }

    public override getAll(): Observable<PaginatedData<Item>> {
        return of({
            items: [],
            length: 0,
            pageIndex: 0,
            pageSize: 5,
        }).pipe(delay(500));
    }

    public override count(): Observable<number> {
        return of(0).pipe(delay(500));
    }
}
