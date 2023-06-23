import {Observable, of} from 'rxjs';
import {Item, ItemService} from './item.service';
import {inject} from '@angular/core';

/**
 * Resolve taxonomy data for router and panels service
 */
export function resolveAny(): Observable<{model: Item}> {
    const itemService = inject(ItemService);
    console.warn('resolve any');
    return of({model: itemService.getItem(true)});
}
