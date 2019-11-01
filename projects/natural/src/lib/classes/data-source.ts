/**
 * Data source to provide what data should be rendered in the table. The observable provided
 * in connect should emit exactly the data that should be rendered by the table. If the data is
 * altered, the observable should emit that new set of data on the stream. In our case here,
 * we return a stream that contains only one set of data that doesn't change.
 */

import { DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { Literal } from '../types/types';

// @formatter:off
export type NavigableItem<T> = T & {
    hasNavigation?: boolean;
};
// @formatter:on

export interface PaginatedData<T> {
    items: NavigableItem<T>[];
    offset?: number;
    pageSize: number;
    pageIndex: number;
    length: number;
}

export class NaturalDataSource<T = any> extends DataSource<T> {

    protected ngUnsubscribe = new Subject<void>();

    private readonly internalData: BehaviorSubject<PaginatedData<T>>;

    constructor(private value: Observable<PaginatedData<T>> | PaginatedData<T>) {
        super();

        if (value instanceof Observable) {
            this.internalData = new BehaviorSubject<PaginatedData<T>>({
                items: [],
                pageSize: 0,
                pageIndex: 0,
                offset: 0,
                length: 0,
            });
            value.pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => this.data = res);
        } else {
            this.internalData = new BehaviorSubject<PaginatedData<T>>(value);
        }
    }

    get internalDataObservable(): Observable<PaginatedData<T>> {
        return this.internalData.asObservable();
    }

    /**
     * Array of data that should be rendered by the table, where each object represents one row.
     */
    get data(): PaginatedData<T> {
        return this.internalData.value;
    }

    set data(data: PaginatedData<T>) {
        this.internalData.next(data);
    }

    public connect(): Observable<T[]> {
        return this.internalData.pipe(takeUntil(this.ngUnsubscribe), map(data => data.items));
    }

    public disconnect(): void {
        this.unsubscribe();
    }

    public push(item: T): void {
        const fullList = this.data === null ? [] : this.data.items;
        fullList.push(item);
        this.data = Object.assign(this.data, {items: fullList, length: fullList.length});
    }

    public pop(): T | undefined {
        const fullList = this.data === null ? [] : this.data.items;
        const removedElement = fullList.pop();
        this.data = Object.assign(this.data, {items: fullList, length: fullList.length});

        return removedElement;
    }

    public remove(item: T): void {
        const index = this.data.items.indexOf(item);
        if (index > -1) {
            this.data.items.splice(index, 1);
            this.data = this.data;
        }
    }

    private unsubscribe(): void {
        this.ngUnsubscribe.next(); // required or complete() will not emit
        this.ngUnsubscribe.complete(); // unsubscribe everybody
    }

    public patchItemAt(index: number, value: Literal) {
        const item = this.data.items[index];
        this.patchItem(item, value);
    }

    public patchItem(item: NavigableItem<T>, value: Literal) {
        Object.assign(item, value);
    }
}
