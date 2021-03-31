import {Apollo} from 'apollo-angular';
import {Injectable} from '@angular/core';
import {Validators} from '@angular/forms';

import {Observable, of} from 'rxjs';
import {PaginatedData} from '../classes/data-source';
import {NaturalQueryVariablesManager, QueryVariables} from '../classes/query-variable-manager';
import {FormValidators, NaturalAbstractModelService} from '../services/abstract-model.service';
import {delay, switchMap} from 'rxjs/operators';
import {Literal} from '@ecodev/natural';

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
export class AnyService extends NaturalAbstractModelService<
    Item,
    {id: string},
    PaginatedData<Item>,
    QueryVariables,
    Item,
    {input: Item},
    Item,
    {id: string; input: Literal},
    boolean,
    {ids: string[]}
> {
    private id = 1;

    constructor(apollo: Apollo) {
        super(apollo, 'user', null, null, null, null, null);
    }

    public getItem(withChildren: boolean = false, parentsDeep: number = 0, wantedId?: string): Item {
        const id = wantedId ?? this.id++;
        return {
            id: '' + id,
            name: 'name-' + id,
            description: 'description-' + id,
            children: withChildren ? [this.getItem(), this.getItem()] : [],
            parent: parentsDeep > 0 ? this.getItem(withChildren, parentsDeep - 1) : null,
        };
    }

    /**
     * Possibly return correct items with wanted ID or random items
     */
    private getItems(queryVariablesManager: NaturalQueryVariablesManager): Observable<PaginatedData<Item>> {
        const wantedIds: string[] | undefined =
            queryVariablesManager.variables.value?.filter?.groups?.[0]?.conditions?.[0]?.id?.in?.values;

        let paginatedItems: PaginatedData<Item>;
        if (wantedIds) {
            const items = wantedIds.map(id => this.getItem(true, 0, id));

            paginatedItems = {
                items: items,
                length: items.length,
                pageIndex: 0,
                pageSize: Math.max(5, items.length),
            };
        } else {
            paginatedItems = {
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
            };
        }

        return of(paginatedItems).pipe(delay(500));
    }

    public watchAll(
        queryVariablesManager: NaturalQueryVariablesManager,
        expire: Observable<void>,
    ): Observable<PaginatedData<Item>> {
        return queryVariablesManager.variables.pipe(switchMap(() => this.getItems(queryVariablesManager)));
    }

    public getAll(queryVariablesManager: NaturalQueryVariablesManager): Observable<PaginatedData<Item>> {
        return this.getItems(queryVariablesManager);
    }

    public getOne(id: string): Observable<Item> {
        return of(this.getItem(true, 2, id));
    }

    protected getDefaultForClient(): Literal {
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
        return of(countsList[Math.floor(Math.random() * countsList.length)]).pipe(delay(500));
    }

    public create(object: Item): Observable<Item> {
        return of({...object, id: this.id++ as any}).pipe(delay(500));
    }

    public delete(objects: {id: string}[]): Observable<boolean> {
        return of(true).pipe(delay(500));
    }
}
