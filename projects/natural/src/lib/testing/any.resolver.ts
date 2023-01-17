import {Injectable} from '@angular/core';
import {Resolve} from '@angular/router';
import {Observable, of} from 'rxjs';
import {Item, ItemService} from './item.service';

@Injectable({
    providedIn: 'root',
})
export class AnyResolver implements Resolve<{model: Item}> {
    public constructor(private readonly itemService: ItemService) {}

    /**
     * Resolve taxonomy data for router and panels service
     */
    public resolve(): Observable<{model: Item}> {
        console.warn('resolve any');
        return of({model: this.itemService.getItem(true)});
    }
}
