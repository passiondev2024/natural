import { Injectable } from '@angular/core';
import { NaturalAbstractModelService } from '../services/abstract-model.service';
import { Apollo } from 'apollo-angular';

@Injectable({
    providedIn: 'root',
})
export class NotConfiguredService extends NaturalAbstractModelService<any, any, any, any, any, any, any, any, any> {
    constructor(apollo: Apollo) {
        super(apollo,
            'nothing',
            null,
            null,
            null,
            null,
            null);
    }
}
