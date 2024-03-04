import {
    catchError,
    debounceTime,
    EMPTY,
    forkJoin,
    map,
    mergeMap,
    Observable,
    of,
    raceWith,
    ReplaySubject,
    shareReplay,
    Subject,
    take,
} from 'rxjs';
import {Injectable} from '@angular/core';
import {NaturalAbstractModelService} from './abstract-model.service';

type Debounced<T> = {
    source: Observable<T>;
    debouncer: Subject<void>;
    canceller: Subject<void>;
    flusher: Subject<void>;
    result: Observable<T>;
};
type Key = NaturalAbstractModelService<unknown, any, any, any, unknown, any, unknown, any, unknown, any>;

/**
 * Debounce subscriptions to observable, with possibility to cancel one, or flush all of them. Typically,
 * observables are object updates, so `NaturalAbstractModelService.updateNow()`.
 *
 * `key` must be an instance of `NaturalAbstractModelService` to separate objects by their types. So User with ID 1 is
 * not confused with Product with ID 1. It has no other purpose.
 *
 * `id` should be the ID of the object that will be updated.
 */
@Injectable({
    providedIn: 'root',
})
export class NaturalDebounceService {
    /**
     * Stores the debounced update function
     */
    private readonly allDebouncedUpdateCache = new Map<Key, Map<string, Debounced<unknown>>>();

    /**
     * Debounce the given source observable for a short time. If called multiple times with the same key and id,
     * it will postpone the subscription to the source observable.
     *
     * Giving the same key and id but a different source observable will replace the original observable, but
     * keep the same debouncing timeline.
     */
    public debounce<T>(key: Key, id: string, source: Observable<T>): Observable<T> {
        const debouncedUpdateCache = this.getMap(key) as Map<string, Debounced<T>>;
        let debounced = debouncedUpdateCache.get(id);

        if (debounced) {
            debounced.source = source;
        } else {
            const debouncer = new ReplaySubject<void>(1);
            let wasCancelled = false;
            const canceller = new Subject<void>();
            canceller.subscribe(() => {
                wasCancelled = true;
                debouncer.complete();
                canceller.complete();
                this.delete(key, id);
            });

            const flusher = new Subject<void>();

            debounced = {
                debouncer,
                canceller,
                flusher,
                source,
                result: debouncer.pipe(
                    debounceTime(2000), // Wait 2 seconds...
                    raceWith(flusher), // ...unless flusher is triggered
                    take(1),
                    mergeMap(() => {
                        this.delete(key, id);

                        if (wasCancelled || !debounced) {
                            return EMPTY;
                        }

                        return debounced.source;
                    }),
                    shareReplay(), // All attempts to update will share the exact same single result from API
                ),
            };

            debouncedUpdateCache.set(id, debounced);
        }

        // Notify our debounced update each time we ask to update
        debounced.debouncer.next();

        // Return and observable that is updated when mutation is done
        return debounced.result;
    }

    public cancelOne(key: Key, id: string): void {
        const debounced = this.allDebouncedUpdateCache.get(key)?.get(id);
        debounced?.canceller.next();
    }

    /**
     * Immediately execute the pending update, if any.
     *
     * It should typically be called before resolving the object, to mutate it before re-fetching it from server.
     *
     * The returned observable will complete when the update completes, even if it errors.
     */
    public flushOne(key: Key, id: string): Observable<void> {
        const debounced = this.allDebouncedUpdateCache.get(key)?.get(id);

        return this.internalFlush(debounced ? [debounced] : []);
    }

    /**
     * Immediately execute all pending updates.
     *
     * It should typically be called before login out.
     *
     * The returned observable will complete when all updates complete, even if some of them error.
     */
    public flush(): Observable<void> {
        const all: Debounced<unknown>[] = [];
        this.allDebouncedUpdateCache.forEach(map => map.forEach(debounced => all.push(debounced)));

        return this.internalFlush(all);
    }

    private internalFlush(debounceds: Debounced<unknown>[]): Observable<void> {
        const all: Observable<unknown>[] = [];
        const allFlusher: Subject<void>[] = [];

        debounceds.forEach(debounced => {
            all.push(debounced.result.pipe(catchError(() => of(undefined))));
            allFlusher.push(debounced.flusher);
        });

        if (!all.length) {
            all.push(of(undefined));
        }

        return new Observable(subscriber => {
            const subscription = forkJoin(all)
                .pipe(map(() => undefined))
                .subscribe(subscriber);

            // Flush only after subscription process is finished
            allFlusher.forEach(flusher => flusher.next());

            return subscription;
        });
    }

    /**
     * Count of pending updates
     */
    public get count(): number {
        let count = 0;
        this.allDebouncedUpdateCache.forEach(map => (count += map.size));

        return count;
    }

    private getMap(key: Key): Map<string, Debounced<unknown>> {
        let debouncedUpdateCache = this.allDebouncedUpdateCache.get(key);
        if (!debouncedUpdateCache) {
            debouncedUpdateCache = new Map<string, Debounced<unknown>>();
            this.allDebouncedUpdateCache.set(key, debouncedUpdateCache);
        }

        return debouncedUpdateCache;
    }

    private delete(key: Key, id: string): void {
        const map = this.allDebouncedUpdateCache.get(key);
        if (!map) {
            return;
        }

        map.delete(id);

        if (!map.size) {
            this.allDebouncedUpdateCache.delete(key);
        }
    }
}
