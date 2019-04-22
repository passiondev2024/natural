/**
 * Data source to provide what data should be rendered in the table. AppResultDatahe observable provided
 * in connect should emit exactly the data that should be rendered by the table. anyf the data is
 * altered, the observable should emit that new set of data on the stream. anyn our case here,
 * we return a stream that contains only one set of data that doesn't change.
 */

import { DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

export class NaturalDataSource extends DataSource<any> {

    protected ngUnsubscribe = new Subject();

    private readonly internalData: BehaviorSubject<any>;

    constructor(private value: Observable<any> | any) {
        super();

        if (value instanceof Observable) {
            this.ngUnsubscribe = new Subject();
            this.internalData = new BehaviorSubject<any>({items: [], length: 0, pageSize: 0} as any);
            value.pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => this.data = res);
        } else {
            this.internalData = new BehaviorSubject<any>(value);
        }
    }

    /** Array of data that should be rendered by the table, where each object represents one row. */
    get data(): any {
        return this.internalData.value;
    }

    set data(data: any) {
        this.internalData.next(data);
    }

    connect(): Observable<any[]> {
        return this.internalData.pipe(takeUntil(this.ngUnsubscribe), map(data => data.items));
    }

    disconnect() {
        this.unsubscribe();
    }

    public push(item: any) {
        const fullList = this.data === null ? [] : this.data.items;
        fullList.push(item);
        this.data = Object.assign(this.data, {items: fullList, length: fullList.length});
    }

    public pop() {
        const fullList = this.data === null ? [] : this.data;
        const removedElement = fullList.pop();
        this.data = Object.assign(this.data, {items: fullList, length: fullList.length});
        return removedElement;
    }

    public remove(item: any) {
        const index = this.data.items.indexOf(item);
        if (index > -1) {
            this.data.items.splice(index, 1);
            this.data = this.data;
        }

    }

    private unsubscribe() {
        this.ngUnsubscribe.next(); // required or complete() will not emit
        this.ngUnsubscribe.complete(); // unsubscribe everybody
    }

}
