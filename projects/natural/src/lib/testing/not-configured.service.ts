import {Apollo} from 'apollo-angular';
import {Injectable} from '@angular/core';

import {NaturalAbstractModelService} from '../services/abstract-model.service';

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
    constructor(apollo: Apollo) {
        super(apollo, 'nothing', null, null, null, null, null);
    }
}
