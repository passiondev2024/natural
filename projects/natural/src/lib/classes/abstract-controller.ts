import {Directive, OnDestroy} from '@angular/core';
import {Subject} from 'rxjs';

@Directive()
export class NaturalAbstractController implements OnDestroy {
    /**
     * Usage:
     *
     * ```ts
     * import { takeUntil } from 'rxjs/operators';
     * .pipe(takeUntil(this.ngUnsubscribe)) // as first pipe on observables that should be destroyed on component destroy
     * ```
     *
     * @deprecated Instead of this, you should create the observable in the constructor or field initializers and use
     * Angular native `.pipe(takeUntilDestroyed())`. And most likely subscribe at a later point. We keep this method until
     * all existing usages (typically in `ngOnInit()`) are migrated away.
     */
    protected readonly ngUnsubscribe = new Subject<void>();

    public ngOnDestroy(): void {
        this.ngUnsubscribe.next(); // unsubscribe everybody
        this.ngUnsubscribe.complete(); // complete the stream, because we will never emit again
    }
}
