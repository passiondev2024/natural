/**
 * Data source to provide what data should be rendered in the table. The observable provided
 * in connect should emit exactly the data that should be rendered by the table. If the data is
 * altered, the observable should emit that new set of data on the stream. In our case here,
 * we return a stream that contains only one set of data that doesn't change.
 */

import {DataSource} from '@angular/cdk/collections';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {map, takeUntil} from 'rxjs/operators';
import {Literal} from '../types/types';

export interface PaginatedData<T> {
    items: T[];
    offset?: number;
    pageSize: number;
    pageIndex: number;
    length: number;
}

/**
 * A NaturalDataSource will connect immediately, in order to know as soon as possible if
 * we need to show a template at all (as seen in my-ichtus)
 *
 * It also allow some extra data manipulation
 */
export class NaturalDataSource<T extends PaginatedData<Literal> = PaginatedData<Literal>> extends DataSource<
    T['items'][0]
> {
    private readonly ngUnsubscribe = new Subject<void>();

    private readonly internalData: BehaviorSubject<T | null>;

    constructor(value: Observable<T> | T) {
        super();

        if (value instanceof Observable) {
            this.internalData = new BehaviorSubject<T | null>(null);
            value.pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => (this.data = res));
        } else {
            this.internalData = new BehaviorSubject<T | null>(value);
        }
    }

    get internalDataObservable(): Observable<T | null> {
        return this.internalData;
    }

    /**
     * Array of data that should be rendered by the table, where each object represents one row.
     */
    get data(): T | null {
        return this.internalData.value;
    }

    set data(data: T | null) {
        this.internalData.next(data);
    }

    public connect(): Observable<T['items']> {
        return this.internalData.pipe(
            takeUntil(this.ngUnsubscribe),
            map(data => (data ? data.items : [])),
        );
    }

    public disconnect(): void {
        this.ngUnsubscribe.next(); // required or complete() will not emit
        this.ngUnsubscribe.complete(); // unsubscribe everybody
    }

    public push(item: T['items'][0]): void {
        if (!this.data) {
            return;
        }

        const fullList = this.data.items;
        fullList.push(item);
        this.data = Object.assign(this.data, {items: fullList, length: fullList.length});
    }

    public pop(): T['items'][0] | undefined {
        if (!this.data) {
            return;
        }

        const fullList = this.data.items;
        const removedElement = fullList.pop();
        this.data = Object.assign(this.data, {items: fullList, length: fullList.length});

        return removedElement;
    }

    public remove(item: T['items'][0]): void {
        if (!this.data) {
            return;
        }

        const index = this.data.items.indexOf(item);
        if (index > -1) {
            this.data.items.splice(index, 1);
            this.data.length--;
            this.data = this.data;
        }
    }
}
