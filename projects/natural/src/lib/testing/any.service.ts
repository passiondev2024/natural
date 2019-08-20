import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
    FormValidators,
    NaturalAbstractModelService,
    NaturalQueryVariablesManager,
    PaginatedData,
    QueryVariables,
} from '@ecodev/natural';
import { Apollo } from 'apollo-angular';
import { Observable, of } from 'rxjs';
import { Validators } from '@angular/forms';

export interface Item {
    id: string;
    name: string;
    description: string;
    children: Item[];
}

@Injectable({
    providedIn: 'root',
})
export class AnyService extends NaturalAbstractModelService<Item,
    { id: string },
    PaginatedData<Item>,
    QueryVariables,
    never,
    never,
    never,
    never,
    never> {

    private id = 1;

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

    public getItem(withChildren: boolean = false): Item {
        const id = this.id++;
        return {
            id: '' + id,
            name: 'name-' + id,
            description: 'description-' + id,
            children: withChildren ? [this.getItem(), this.getItem()] : [],
        };
    }

    public watchAll(queryVariablesManager: NaturalQueryVariablesManager<any>, expire: Observable<void>): Observable<PaginatedData<Item>> {
        return of({
            items: [
                this.getItem(true),
                this.getItem(true),
                this.getItem(true),
                this.getItem(true),
                this.getItem(true),
            ],
            length: 5,
            pageIndex: 0,
            pageSize: 5,
        });
    }

    public getAll(queryVariablesManager: NaturalQueryVariablesManager<any>): Observable<PaginatedData<Item>> {
        return of({
            items: [
                this.getItem(true),
                this.getItem(true),
                this.getItem(true),
                this.getItem(true),
                this.getItem(true),
            ],
            length: 5,
            pageIndex: 0,
            pageSize: 5,
        });
    }

    public getOne(id: string): Observable<Item> {
        return of(this.getItem(true));
    }

    protected getDefaultForClient() {
        return {
            name: '',
            description: '',
            children: [],
        };
    }

    public getFormValidators(): FormValidators {
        return {
            name: [Validators.required, Validators.maxLength(10)],
            description: [Validators.maxLength(20)],
        };
    }
}
