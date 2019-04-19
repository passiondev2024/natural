import { NaturalCapitalizePipe } from './capitalize.pipe';
import { BehaviorSubject, Observable } from 'rxjs';

describe('NaturalCapitalizePipe', () => {
    it('create an instance', () => {
        const pipe = new NaturalCapitalizePipe();
        expect(pipe).toBeTruthy();
    });

    it('capitalize a string', () => {
        const pipe = new NaturalCapitalizePipe();
        expect(pipe.transform('foo bar')).toBe('Foo bar');
    });

    it('no effect on capitalized string', () => {
        const pipe = new NaturalCapitalizePipe();
        expect(pipe.transform('Foo bar')).toBe('Foo bar');
    });

    it('do not crash with null', () => {
        const pipe = new NaturalCapitalizePipe();
        expect(pipe.transform(null)).toBeNull();
    });

    it('capitalize a string within an observable', () => {
        const pipe = new NaturalCapitalizePipe();
        const obs1 = new BehaviorSubject('foo bar');
        let actual1 = 'initial';
        (pipe.transform(obs1) as Observable<string>).subscribe(v => actual1 = v);
        expect(actual1).toBe('Foo bar');
    });

    it('do not crash with null within an observable', () => {
        const pipe = new NaturalCapitalizePipe();
        const obs1 = new BehaviorSubject(null);
        let actual1 = 'initial';
        (pipe.transform(obs1) as Observable<string>).subscribe(v => actual1 = v);
        expect(actual1).toBeNull();
    });
});
