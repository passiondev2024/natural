import {fakeAsync, TestBed, tick} from '@angular/core/testing';
import {TestScheduler} from 'rxjs/testing';
import {Observable, of, tap, throwError} from 'rxjs';
import {NaturalDebounceService} from './debounce.service';

type SpyResult = {
    called: number;
    completed: number;
    errored: number;
    subscribed: number;
    unsubscribed: number;
};

function spyResult(): SpyResult {
    return {
        called: 0,
        completed: 0,
        errored: 0,
        subscribed: 0,
        unsubscribed: 0,
    };
}

function spy<T>(observable: Observable<T>, result: SpyResult): Observable<T> {
    return observable.pipe(
        tap({
            next: () => result.called++,
            complete: () => result.completed++,
            error: () => result.errored++,
            subscribe: () => result.subscribed++,
            unsubscribe: () => result.unsubscribed++,
        }),
    );
}

describe('NaturalDebounceService', () => {
    let scheduler: TestScheduler;
    let service: NaturalDebounceService;
    const modelServiceA = 'A' as any;
    const modelServiceB = 'B' as any;

    beforeEach(() => {
        scheduler = new TestScheduler((actual, expected) => {
            expect(actual).toEqual(expected);
        });

        service = TestBed.inject(NaturalDebounceService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
        expect(service.count).toBe(0);
    });

    it('should flushOne non-existing then emit', () => {
        scheduler.run(({expectObservable}) => {
            const flushOne = service.flushOne(modelServiceA, 'non-existing');
            expectObservable(flushOne).toBe('(a|)', {a: undefined});
        });
    });

    it('should flushOne an error and then still emit and complete', fakeAsync(() => {
        const flushOne = spyResult();
        const error = spyResult();
        const error$ = spy(
            throwError(() => 'fake extra error'),
            error,
        );

        service.debounce(modelServiceA, '1', error$);

        spy(service.flushOne(modelServiceA, '1'), flushOne).subscribe();

        tick(1000);

        expect(flushOne).toEqual({
            called: 1,
            completed: 1,
            errored: 0,
            subscribed: 1,
            unsubscribed: 0,
        });

        expect(error).toEqual({
            called: 0,
            completed: 0,
            errored: 1,
            subscribed: 1,
            unsubscribed: 0,
        });
    }));

    it('should flushOne a successfull update and emit and complete', fakeAsync(() => {
        const a1 = spyResult();
        const a1$ = spy(of(1), a1);
        const flushOne = spyResult();

        service.debounce(modelServiceA, '1', a1$);

        spy(service.flushOne(modelServiceA, '1'), flushOne).subscribe();

        tick(1000);

        expect(flushOne).toEqual({
            called: 1,
            completed: 1,
            errored: 0,
            subscribed: 1,
            unsubscribed: 0,
        });

        expect(a1).toEqual({
            called: 1,
            completed: 1,
            errored: 0,
            subscribed: 1,
            unsubscribed: 0,
        });
    }));

    it('should flush without any pending update then emit', () => {
        scheduler.run(({expectObservable}) => {
            const flush = service.flush();
            expectObservable(flush).toBe('(a|)', {a: undefined});
        });
    });

    it('should flush with 1 pending update then emit', fakeAsync(() => {
        const a1 = spyResult();
        const a1Bis = spyResult();
        const flush = spyResult();
        const a1$ = spy(of(1), a1);
        const a1Bis$ = spy(of(1), a1Bis);
        service.debounce(modelServiceA, '1', a1$);
        expect(service.count).toBe(1);

        tick(1000); // half-way through debounce

        expect(a1).toEqual(spyResult());

        // debounce again the same key/id but different observable
        service.debounce(modelServiceA, '1', a1Bis$);
        expect(service.count).toBe(1);

        tick(2000); // passed the first debounce, but observable still debounced

        expect(a1).toEqual(spyResult());

        spy(service.flush(), flush).subscribe(result => {
            expect(result).toBeUndefined();
        });

        tick();

        expect(a1).withContext('should not be called at all because was debounced').toEqual(spyResult());

        expect(a1Bis).toEqual({
            called: 1,
            completed: 1,
            errored: 0,
            subscribed: 1,
            unsubscribed: 0,
        });

        expect(flush).toEqual({
            called: 1,
            completed: 1,
            errored: 0,
            subscribed: 1,
            unsubscribed: 0,
        });

        expect(service.count).toBe(0);
    }));

    it('should flush with multiple pending updates then emit', fakeAsync(() => {
        const a1 = spyResult();
        const a2 = spyResult();
        const b1 = spyResult();
        const error = spyResult();
        const flush = spyResult();

        const a1$ = spy(of(1), a1);
        const a2$ = spy(of(2), a2);
        const b1$ = spy(of(1), b1);
        const error$ = spy(
            throwError(() => 'fake extra error'),
            error,
        );

        service.debounce(modelServiceA, '1', a1$);
        service.debounce(modelServiceA, '2', a2$);
        service.debounce(modelServiceB, '1', b1$);
        service.debounce(modelServiceB, '2', error$);

        expect(service.count).toBe(4);

        // again
        service.debounce(modelServiceA, '1', a1$);

        expect(service.count).toBe(4);

        tick(1000); // half-way through debounce

        expect(a1).toEqual(spyResult());
        expect(a2).toEqual(spyResult());
        expect(b1).toEqual(spyResult());
        expect(error).toEqual(spyResult());

        spy(service.flush(), flush).subscribe(result => {
            expect(result).toBeUndefined();
        });

        tick();

        expect(a1).toEqual({
            called: 1,
            completed: 1,
            errored: 0,
            subscribed: 1,
            unsubscribed: 0,
        });

        expect(a2).toEqual({
            called: 1,
            completed: 1,
            errored: 0,
            subscribed: 1,
            unsubscribed: 0,
        });

        expect(b1).toEqual({
            called: 1,
            completed: 1,
            errored: 0,
            subscribed: 1,
            unsubscribed: 0,
        });

        expect(error).toEqual({
            called: 0,
            completed: 0,
            errored: 1,
            subscribed: 1,
            unsubscribed: 0,
        });

        expect(flush).toEqual({
            called: 1,
            completed: 1,
            errored: 0,
            subscribed: 1,
            unsubscribed: 0,
        });

        expect(service.count).toBe(0);
    }));

    it('should cancel one pending update', fakeAsync(() => {
        const a1 = spyResult();
        const a1Bis = spyResult();
        const a1$ = spy(of(1), a1);
        const a1Bis$ = spy(of(1), a1Bis);
        service.debounce(modelServiceA, '1', a1$);
        expect(service.count).toBe(1);

        tick(1000); // half-way through debounce

        expect(a1).toEqual(spyResult());
        expect(a1Bis).toEqual(spyResult());

        // debounce again the same key/id but different observable
        service.debounce(modelServiceA, '1', a1Bis$);
        expect(service.count).toBe(1);

        tick(2000); // passed the first debounce, but observable still debounced

        expect(a1).toEqual(spyResult());
        expect(a1Bis).toEqual(spyResult());

        service.cancelOne(modelServiceA, '1');

        tick(3000);

        expect(a1).toEqual(spyResult());
        expect(a1Bis).toEqual(spyResult());

        expect(service.count).toBe(0);
    }));
});
