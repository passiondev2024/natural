import {Apollo} from 'apollo-angular';
import {Injectable} from '@angular/core';

import {NaturalAbstractModelService} from '../services/abstract-model.service';
import {NaturalDebounceService} from '../services/debounce.service';

/**
 * A service that is not configured at all for testing purposes.
 */
@Injectable({
    providedIn: 'root',
})
export class NotConfiguredService extends NaturalAbstractModelService<
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any
> {
    public constructor(apollo: Apollo, naturalDebounceService: NaturalDebounceService) {
        super(apollo, naturalDebounceService, 'nothing', null, null, null, null, null);
    }
}
