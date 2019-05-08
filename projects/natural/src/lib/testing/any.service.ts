import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { NaturalAbstractModelService, NaturalQueryVariablesManager } from '@ecodev/natural';
import { Apollo } from 'apollo-angular';
import { Observable, of } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class AnyService extends NaturalAbstractModelService<any, any, any, any, any, any, any, any, any> {

    constructor(apollo: Apollo, protected router: Router,
    ) {
        super(apollo,
            'user',
            null,
            null,
            null,
            null,
            null);
    }

    public watchAll(queryVariablesManager: NaturalQueryVariablesManager<any>, expire: Observable<void>): Observable<any> {
        return of({
            items: [
                {id: '1', name: 'name1', tralala: 'tralala1'},
                {id: '2', name: 'name2', tralala: 'tralala2'},
                {id: '3', name: 'name3', tralala: 'tralala3'},
                {id: '4', name: 'name4', tralala: 'tralala4'},
                {id: '5', name: 'name5', tralala: 'tralala5'},
            ],
            length: 0,
            pageIndex: 0,
            pageSize: 10,
        });
    }
}
