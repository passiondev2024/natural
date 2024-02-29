import {Apollo} from 'apollo-angular';
import {Injectable} from '@angular/core';
import {Validators} from '@angular/forms';

import {concatWith, NEVER, Observable, of} from 'rxjs';
import {PaginatedData} from '../classes/data-source';
import {NaturalQueryVariablesManager, QueryVariables} from '../classes/query-variable-manager';
import {FormValidators, NaturalAbstractModelService} from '../services/abstract-model.service';
import {delay, switchMap} from 'rxjs/operators';
import {deepFreeze, Literal} from '@ecodev/natural';
import {deepClone} from '../modules/search/classes/utils';
import {NaturalDebounceService} from '../services/debounce.service';

export type Item = {
    readonly __typename: 'Item';
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly children: readonly Item[];
    readonly parent: Item | null;
};

export type ItemInput = Omit<Item, '__typename' | 'id'>;

@Injectable({
    providedIn: 'root',
})
export class ItemService extends NaturalAbstractModelService<
    Item,
    {id: string},
    PaginatedData<Item>,
    QueryVariables,
    Item,
    {input: ItemInput},
    Item,
    {id: string; input: Partial<ItemInput>},
    boolean,
    {ids: string[]}
> {
    private id = 1;
    private readonly cachedPaginatedItems = new Cache<PaginatedData<Item>>();
    private readonly cachedCount = new Cache<number>();

    public constructor(apollo: Apollo, naturalDebounceService: NaturalDebounceService) {
        super(apollo, naturalDebounceService, 'user', null, null, null, null, null);
    }

    public getItem(withChildren = false, parentsDeep = 0, wantedId?: string): Item {
        const id = wantedId ?? this.id++;
        return deepFreeze({
            __typename: 'Item',
            id: '' + id,
            name: 'name-' + id,
            description: 'description-' + id,
            children: deepFreeze(withChildren ? [this.getItem(), this.getItem()] : []),
            parent: parentsDeep > 0 ? this.getItem(withChildren, parentsDeep - 1) : null,
        });
    }

    /**
     * Possibly return correct items with wanted ID or random items
     */
    private getItems(queryVariablesManager: NaturalQueryVariablesManager): Observable<PaginatedData<Item>> {
        const paginatedItems = this.cachedPaginatedItems.get(queryVariablesManager, () => {
            const wantedIds: string[] | undefined =
                queryVariablesManager.variables.value?.filter?.groups?.[0]?.conditions?.[0]?.id?.in?.values;

            if (wantedIds) {
                const items = wantedIds.map(id => this.getItem(true, 0, id));

                return deepFreeze({
                    items: items,
                    length: items.length,
                    pageIndex: 0,
                    pageSize: Math.max(5, items.length),
                });
            } else {
                return deepFreeze({
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
                });
            }
        });

        return of(paginatedItems).pipe(delay(500));
    }

    public override watchAll(queryVariablesManager: NaturalQueryVariablesManager): Observable<PaginatedData<Item>> {
        return queryVariablesManager.variables.pipe(switchMap(() => this.getItems(queryVariablesManager)));
    }

    public override getAll(queryVariablesManager: NaturalQueryVariablesManager): Observable<PaginatedData<Item>> {
        return this.getItems(queryVariablesManager);
    }

    public override getOne(id: string): Observable<Item> {
        return of(this.getItem(true, 2, id));
    }

    protected override getFormExtraFieldDefaultValues(): Literal {
        return {
            name: '',
            description: '',
            children: [],
            parent: null,
        };
    }

    public override getFormValidators(): FormValidators {
        return {
            name: [Validators.required, Validators.maxLength(10)],
            description: [Validators.maxLength(20)],
        };
    }

    public override count(queryVariablesManager: NaturalQueryVariablesManager): Observable<number> {
        const result = this.cachedCount.get(queryVariablesManager, () => {
            const countsList = [0, 5, 10];
            return countsList[Math.floor(Math.random() * countsList.length)];
        });

        return of(result).pipe(delay(500), concatWith(NEVER));
    }

    public override create(object: Item): Observable<Item> {
        return of({...object, id: this.id++ as any}).pipe(delay(500));
    }

    public override delete(): Observable<boolean> {
        return of(true).pipe(delay(500));
    }
}

/**
 * Simple in-memory cache to give same result when given same NaturalQueryVariablesManager values
 */
class Cache<V> {
    private readonly cache = new Map<string, V>();

    public get(queryVariablesManager: NaturalQueryVariablesManager, compute: () => V): V {
        const key = this.getCacheKey(queryVariablesManager);
        let result = this.cache.get(key);

        if (typeof result === 'undefined') {
            result = compute();
            this.cache.set(key, result);
        }

        return result;
    }

    private getCacheKey(queryVariablesManager: NaturalQueryVariablesManager): string {
        // Be sure to always have a filter, even empty, for consistant cache keys
        const value = deepClone(queryVariablesManager.variables.value ?? {});
        if (value) {
            value.filter ??= {};
        }

        return this.stringify(value);
    }

    /**
     * Same as `JSON.stringify`, but guarantee predictable order of keys
     */
    private stringify(obj: any): string {
        const allKeys: string[] = [];
        JSON.stringify(obj, (key, value) => {
            allKeys.push(key);
            return value;
        });

        allKeys.sort();

        return JSON.stringify(obj, allKeys);
    }
}
