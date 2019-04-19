import { Subject } from 'rxjs';
import { OnDestroy } from '@angular/core';

/**
 * Use
 * import { takeUntil } from 'rxjs/operators';
 * .pipe(takeUntil(this.ngUnsubscribe)) as first pipe on observables that should be destroyed on component destroy
 */
export class NaturalAbstractController implements OnDestroy {

    protected ngUnsubscribe = new Subject<void>();

    constructor() {
    }

    ngOnDestroy() {
        this.ngUnsubscribe.next(); // required or complete() will not emit
        this.ngUnsubscribe.complete(); // unsubscribe everybody
    }

    public back() {
        window.history.back();
    }

}
