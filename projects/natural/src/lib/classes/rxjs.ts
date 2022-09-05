import {MonoTypeOperatorFunction, Observable, timer} from 'rxjs';
import {map, take, takeUntil, tap} from 'rxjs/operators';

/**
 * Behave like setTimeout(), but with a mandatory cancel mechanism.
 *
 * This is typically useful to replace setTimeout() in components where the callback
 * would crash if executed after the component destruction. That can easily happen
 * when the user navigate quickly between pages.
 *
 * Typical usage in a component would be:
 *
 * ```ts
 * cancellableTimeout(this.ngUnsubscribe).subscribe(myCallback);
 * ```
 *
 * Instead of the more error prone:
 *
 * ```ts
 * public foo(): void {
 *     this.timeout = setTimeout(myCallBack);
 * }
 *
 * public ngOnDestroy(): void {
 *     if (this.timeout) {
 *         clearTimeout(this.timeout);
 *         this.timeout = null;
 *      }
 * }
 * ```
 */
export function cancellableTimeout(canceller: Observable<unknown>, milliSeconds: number = 0): Observable<void> {
    return timer(milliSeconds).pipe(
        take(1),
        takeUntil(canceller),
        map(() => {
            return;
        }),
    );
}

/**
 * For debugging purpose only, will dump in console everything that happen to
 * the observable
 */
export function debug<T>(debugName: string): MonoTypeOperatorFunction<T> {
    return tap<T>({
        subscribe: () => console.log('SUBSCRIBE', debugName),
        unsubscribe: () => console.log('UNSUBSCRIBE', debugName),
        next: value => console.log('NEXT', debugName, value),
        error: error => console.log('ERROR', debugName, error),
        complete: () => console.log('COMPLETE', debugName),
    });
}
