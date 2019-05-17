import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { NaturalAbstractModelService, NaturalQueryVariablesManager } from '@ecodev/natural';
import { Apollo } from 'apollo-angular';
import { Observable, of } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class AnyService extends NaturalAbstractModelService<any, any, any, any, any, any, any, any, any> {

    static id = 1;

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
                {id: '' + (AnyService.id++), name: 'name1', tralala: 'tralala1'},
                {id: '' + (AnyService.id++), name: 'name2', tralala: 'tralala2'},
                {id: '' + (AnyService.id++), name: 'name3', tralala: 'tralala3'},
                {id: '' + (AnyService.id++), name: 'name4', tralala: 'tralala4'},
                {id: '' + (AnyService.id++), name: 'name5', tralala: 'tralala5'},
            ],
            length: 5,
            pageIndex: 0,
            pageSize: 5,
        });
    }

    public getAll(queryVariablesManager: NaturalQueryVariablesManager<any>): Observable<any> {
        return of({
            items: [
                {id: '' + (AnyService.id++), name: 'name1', tralala: 'tralala1'},
                {id: '' + (AnyService.id++), name: 'name2', tralala: 'tralala2'},
                {id: '' + (AnyService.id++), name: 'name3', tralala: 'tralala3'},
                {id: '' + (AnyService.id++), name: 'name4', tralala: 'tralala4'},
                {id: '' + (AnyService.id++), name: 'name5', tralala: 'tralala5'},
            ],
            length: 5,
            pageIndex: 0,
            pageSize: 5,
        });
    }

    public getOne(id: string): Observable<any> {
        return of({id: '' + (AnyService.id++), name: 'name1', tralala: 'tralala1'});
    }
}
