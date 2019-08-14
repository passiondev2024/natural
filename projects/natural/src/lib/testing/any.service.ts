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

    public static getItem(withChildren: boolean = false) {
        const id = AnyService.id++;
        return {
            id: '' + (id), name: 'name' + id,
            tralala: 'tralala' + id,
            children: withChildren ? [AnyService.getItem(), AnyService.getItem()] : [],
        };
    }

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

    protected getDefaultForClient() {
        return {
            name: '',
            children: null,
        };
    }

    public watchAll(queryVariablesManager: NaturalQueryVariablesManager<any>, expire: Observable<void>): Observable<any> {
        return of({
            items: [
                AnyService.getItem(true),
                AnyService.getItem(true),
                AnyService.getItem(true),
                AnyService.getItem(true),
                AnyService.getItem(true),
            ],
            length: 5,
            pageIndex: 0,
            pageSize: 5,
        });
    }

    public getAll(queryVariablesManager: NaturalQueryVariablesManager<any>): Observable<any> {
        return of({
            items: [
                AnyService.getItem(true),
                AnyService.getItem(true),
                AnyService.getItem(true),
                AnyService.getItem(true),
                AnyService.getItem(true),
            ],
            length: 5,
            pageIndex: 0,
            pageSize: 5,
        });
    }

    public getOne(id: string): Observable<any> {
        return of(AnyService.getItem(true));
    }
}
