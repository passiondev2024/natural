import {Directive, Inject, OnDestroy} from '@angular/core';
import {Subject} from 'rxjs';

/**
 * Use
 * import { takeUntil } from 'rxjs/operators';
 * .pipe(takeUntil(this.ngUnsubscribe)) as first pipe on observables that should be destroyed on component destroy
 */
@Directive()
export class NaturalAbstractController implements OnDestroy {
    protected readonly ngUnsubscribe = new Subject<void>();

    public constructor() {}

    public ngOnDestroy(): void {
        this.ngUnsubscribe.next(); // unsubscribe everybody
        this.ngUnsubscribe.complete(); // complete the stream, because we will never emit again
    }

    public back(): void {
        // This is bad, but we don't want to force the injection of document in ,
        // all our child classes. And hopefully this particular method is only called
        // by a user-interaction, so not used in SSR
        // eslint-disable-next-line no-restricted-globals
        window.history.back();
    }
}
