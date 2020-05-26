import {cancellableTimeout} from './rxjs';
import {ReplaySubject, Subject} from 'rxjs';
import {fakeAsync, tick} from '@angular/core/testing';

describe('cancellableTimeout', () => {
    const observer = {
        next: () => {
            count++;
        },
        complete: () => {
            completed = true;
        },
    };
    let count = 0;
    let completed = false;

    beforeEach(() => {
        count = 0;
        completed = false;
    });

    it('run the callback exactly once', fakeAsync(() => {
        const canceller = new Subject<void>();
        const timeout = cancellableTimeout(canceller);

        expect(count).toBe(0, 'nothing happened yet');
        expect(completed).toBe(false);

        tick();
        expect(count).toBe(0, 'still nothing happened because no subscriber');
        expect(completed).toBe(false);

        timeout.subscribe(observer);
        expect(count).toBe(0, 'still nothing happened because time did not pass');
        expect(completed).toBe(false);

        tick();
        expect(count).toBe(1, 'callback called exactly once');
        expect(completed).toBe(true);

        canceller.next();
        tick();
        expect(count).toBe(1, 'already completed, nothing change');
        expect(completed).toBe(true);
    }));

    it('never run the callback if cancelled', fakeAsync(() => {
        const canceller = new ReplaySubject<void>();
        const timeout = cancellableTimeout(canceller);
        canceller.next();

        expect(count).toBe(0, 'nothing happened yet');
        expect(completed).toBe(false);

        tick();
        expect(count).toBe(0, 'still nothing happened because no subscriber');
        expect(completed).toBe(false);

        timeout.subscribe(observer);
        expect(count).toBe(0, 'still nothing happened because cancelled');
        expect(completed).toBe(true);

        tick();
        expect(count).toBe(0, 'already completed, nothing change');
        expect(completed).toBe(true);
    }));
});
