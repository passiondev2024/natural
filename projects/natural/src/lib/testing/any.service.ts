import { Injectable } from '@angular/core';
import { Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { Observable, of } from 'rxjs';
import { PaginatedData } from '../classes/data-source';
import { NaturalQueryVariablesManager, QueryVariables } from '../classes/query-variable-manager';
import { FormValidators, NaturalAbstractModelService } from '../services/abstract-model.service';
import { delay } from 'rxjs/operators';

export interface Item {
    id: string;
    name: string;
    description: string;
    children: Item[];
    parent: Item | null;
}

@Injectable({
    providedIn: 'root',
})
export class AnyService extends NaturalAbstractModelService<Item,
    { id: string },
    PaginatedData<Item>,
    QueryVariables,
    Item,
    { input: Item },
    never,
    never,
    boolean> {

    private id = 1;

    constructor(
        apollo: Apollo,
        protected router: Router,
    ) {
        super(apollo,
            'user',
            null,
            null,
            null,
            null,
            null);
    }

    public getItem(withChildren: boolean = false, parentsDeep: number = 0): Item {
        const id = this.id++;
        return {
            id: '' + id,
            name: 'name-' + id,
            description: 'description-' + id,
            children: withChildren ? [this.getItem(), this.getItem()] : [],
            parent: parentsDeep > 0 ? this.getItem(withChildren, parentsDeep - 1) : null,
        };
    }

    public watchAll(
        queryVariablesManager: NaturalQueryVariablesManager<QueryVariables>,
        expire: Observable<void>,
    ): Observable<PaginatedData<Item>> {
        return of({
            items: [
                this.getItem(true),
                this.getItem(true),
                this.getItem(true),
                this.getItem(true),
                this.getItem(true),
            ],
            length: 20,
            pageIndex: 0,
            pageSize: 5,
        }).pipe(delay(1000));
    }

    public getAll(
        queryVariablesManager: NaturalQueryVariablesManager<QueryVariables>,
    ): Observable<PaginatedData<Item>> {
        return of({
            items: [
                this.getItem(true),
                this.getItem(true),
                this.getItem(true),
                this.getItem(true),
                this.getItem(true),
            ],
            length: 20,
            pageIndex: 0,
            pageSize: 5,
        }).pipe(delay(1000));
    }

    public getOne(id: string): Observable<Item> {
        return of(this.getItem(true, 2));
    }

    protected getDefaultForClient() {
        return {
            name: '',
            description: '',
            children: [],
            parent: null,
        };
    }

    public getFormValidators(): FormValidators {
        return {
            name: [Validators.required, Validators.maxLength(10)],
            description: [Validators.maxLength(20)],
        };
    }

    public count(queryVariablesManager: unknown): Observable<number> {
        const countsList = [0, 5, 10];
        return of(countsList[Math.floor(Math.random() * countsList.length)]).pipe(delay(1000));
    }

    public create(object: { input: Item }['input']): Observable<Item> {
        return of({...object, id: this.id++ as any}).pipe(delay(1000));
    }

    public delete(objects: { id: string }[]): Observable<boolean> {
        return of(true).pipe(delay(1000));
    }
}
