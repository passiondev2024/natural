import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';
import {NaturalSidenavContainerComponent} from './sidenav-container/sidenav-container.component';

@Injectable({providedIn: 'root'})
export class NaturalSidenavStackService {
    /**
     * The stack of all currently living sidenavs
     */
    private readonly sidenavs: NaturalSidenavContainerComponent[] = [];

    /**
     * Emits the most recent living SidenavContainer whenever it changes. So it's
     * either the SidenavContainer that was just added, or the one "before" the
     * SidenavContainer that was just removed
     */
    public readonly currentSidenav = new Subject<NaturalSidenavContainerComponent | undefined>();

    /**
     * For internal use only
     * @internal
     */
    public register(sidenav: NaturalSidenavContainerComponent): void {
        const exists = this.sidenavs.some(s => s.name === sidenav.name);

        // Prevent duplicated name, and so on local storage or further access conflicts
        if (exists) {
            throw new Error('Duplicated side nav name: ' + sidenav.name);
        }

        this.sidenavs.push(sidenav);
        this.next();
    }

    /**
     * For internal use only
     * @internal
     */
    public unregister(sidenav: NaturalSidenavContainerComponent): void {
        const index = this.sidenavs.indexOf(sidenav);
        if (index === -1) {
            throw Error('Trying to remove a SidenavContainer that was never registered');
        }

        this.sidenavs.splice(index, 1);
        this.next();
    }

    private next(): void {
        this.currentSidenav.next(this.sidenavs[this.sidenavs.length - 1]);
    }
}
