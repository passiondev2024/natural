import {TestBed} from '@angular/core/testing';
import {NaturalSidenavStackService} from './sidenav-stack.service';
import {NaturalSidenavContainerComponent} from './sidenav-container/sidenav-container.component';

describe('NaturalSidenavStackService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({});
    });

    it('should be created', () => {
        const service = TestBed.inject(NaturalSidenavStackService);
        expect(service).toBeTruthy();
    });

    it('should notify of new sidenav', done => {
        const service = TestBed.inject(NaturalSidenavStackService);
        const sideNav = {name: 'first'} as NaturalSidenavContainerComponent;

        service.currentSidenav.subscribe(current => {
            expect(current).toBe(sideNav);
            done();
        });

        service.register(sideNav);
    });

    it('should notify of second new sidenav', done => {
        const service = TestBed.inject(NaturalSidenavStackService);
        const first = {name: 'first'} as NaturalSidenavContainerComponent;
        const second = {name: 'second'} as NaturalSidenavContainerComponent;

        service.register(first);

        service.currentSidenav.subscribe(current => {
            expect(current).toBe(second);
            done();
        });

        service.register(second);
    });

    it('should notify of first sidenav after removal of second', done => {
        const service = TestBed.inject(NaturalSidenavStackService);
        const first = {name: 'first'} as NaturalSidenavContainerComponent;
        const second = {name: 'second'} as NaturalSidenavContainerComponent;

        service.register(first);
        service.register(second);

        service.currentSidenav.subscribe(current => {
            expect(current).toBe(first);
            done();
        });
        service.unregister(second);
    });

    it('should notify of undefined after removal of last sidenav', done => {
        const service = TestBed.inject(NaturalSidenavStackService);
        const first = {name: 'first'} as NaturalSidenavContainerComponent;

        service.register(first);

        service.currentSidenav.subscribe(current => {
            expect(current).toBeUndefined();
            done();
        });
        service.unregister(first);
    });

    it('should throw if adding same object twice', () => {
        const service = TestBed.inject(NaturalSidenavStackService);
        const first = {name: 'first'} as NaturalSidenavContainerComponent;

        service.register(first);
        expect(() => service.register(first)).toThrowError('Duplicated side nav name: first');
    });

    it('should throw if adding different object with same name', () => {
        const service = TestBed.inject(NaturalSidenavStackService);
        const first = {name: 'first'} as NaturalSidenavContainerComponent;
        const firstBis = {name: 'first'} as NaturalSidenavContainerComponent;

        service.register(first);
        expect(() => service.register(firstBis)).toThrowError('Duplicated side nav name: first');
    });
});
