import {Apollo} from 'apollo-angular';
import {Injectable} from '@angular/core';

import {NaturalAbstractModelService} from '../services/abstract-model.service';

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
    public constructor(apollo: Apollo) {
        super(apollo, 'nothing', null, null, null, null, null);
    }
}
