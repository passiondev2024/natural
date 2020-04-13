import { Inject, Injectable } from '@angular/core';
import { MediaObserver } from '@angular/flex-layout';
import { MatDrawer, MatDrawerContainer } from '@angular/material/sidenav';
import { NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { NaturalAbstractController } from '../../classes/abstract-controller';
import { NaturalSidenavContainerComponent } from './sidenav-container/sidenav-container.component';
import { NaturalStorage, SESSION_STORAGE } from '../../classes/memory-storage';

/**
 * @TODO : Fix nav minimize and maximize resize
 * Since Material 2 beta 10, when nav is resized the body is not resized
 * https://github.com/angular/material2/issues/6743
 * Maybe the better is to wait next release
 */
@Injectable({providedIn: 'root'})
export class NaturalSidenavService extends NaturalAbstractController {

    public static sideNavs = new Map<string, NaturalSidenavContainerComponent>();
    public static sideNavsChange = new BehaviorSubject(null);

    /**
     * Navigation modes
     * First is for desktop view
     * Second is for mobile view
     */
    private modes = [
        'side',
        'push',
    ];

    /**
     * Activated mode
     * Default to desktop view
     */
    private mode = this.modes[0];

    /**
     * Wherever is nav is opened or not
     */
    private opened = true;

    /**
     * Stores the opened status during mobile view, to restore if we come back to desktop view
     */
    private tmpOpened: boolean = this.opened;

    /**
     * Wherever is nav is minimized or not
     */
    private minimized = false;

    /**
     * LocalStorage key that stores the minized status
     */
    private minimizedStorageKey = 'menu-minimized';

    /**
     * LocalStorage key that stores the opened status
     */
    private openedStorageKey = 'menu-opened';

    private minimizedStorageKeyWithName: string;
    private openedStorageKeyWithName: string;

    private container: MatDrawerContainer;
    private drawer: MatDrawer;

    constructor(
        public mediaObserver: MediaObserver,
        private router: Router,
        @Inject(SESSION_STORAGE) private readonly sessionStorage: NaturalStorage,
    ) {
        super();
    }

    get activeMode(): string {
        return this.mode;
    }

    get isOpened(): boolean {
        return this.opened;
    }

    get isMinimized(): boolean {
        return this.minimized;
    }

    public destroy(name: string) {
        NaturalSidenavService.sideNavs.delete(name);
        NaturalSidenavService.sideNavsChange.next(null);
    }

    public init(
        name: string,
        container: MatDrawerContainer,
        drawer: MatDrawer,
        component: NaturalSidenavContainerComponent,
        autoclose: boolean = false,
    ): void {

        if (!name || name === '') {
            throw new Error('No sidenav name provided, use <natural-sidenav-container name="menu">');
        }

        // Prevent duplicated name, and so on local storage or further access conflicts
        if (NaturalSidenavService.sideNavs.get(name)) {
            throw new Error('Duplicated side nav name');
        }

        NaturalSidenavService.sideNavs.set(name, component);
        NaturalSidenavService.sideNavsChange.next(null);

        this.container = container;
        this.drawer = drawer;

        container.autosize = true;

        this.minimizedStorageKeyWithName = name + '-' + this.minimizedStorageKey;
        this.openedStorageKeyWithName = name + '-' + this.openedStorageKey;

        // Init from LocalStorage
        this.minimized = this.getMinimizedStatus();
        this.opened = this.getMenuOpenedStatus();
        this.tmpOpened = this.opened;

        let oldIsBig: boolean | null = null;
        this.mediaObserver.asObservable().pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {

            const isBig = !this.isMobileView();
            this.mode = isBig ? this.modes[0] : this.modes[1];

            if (oldIsBig === null || isBig !== oldIsBig) {

                oldIsBig = isBig;

                // If decrease window size, save status of menu before closing it
                if (!isBig) {
                    this.tmpOpened = this.opened;
                    this.opened = false;
                }

                // If increase window size, and sidebar was open before, re-open it.
                if (isBig && this.tmpOpened) {
                    this.opened = true;
                    this.minimized = this.getMinimizedStatus();
                }
            }
        });

        if (autoclose) {
            this.router.events.pipe(takeUntil(this.ngUnsubscribe), filter(e => e instanceof NavigationEnd)).subscribe(() => {
                this.navItemClicked();
            });
        }
    }

    public isMobileView() {
        return !this.mediaObserver.isActive('gt-sm');
    }

    /**
     * Close nav on mobile view after a click
     */
    public navItemClicked() {
        if (this.isMobileView()) {
            this.close();
        }
    }

    /**
     * Change minimized status and stores the new value
     */
    public setMinimized(value: boolean) {
        this.minimized = value;
        this.sessionStorage.setItem(this.minimizedStorageKeyWithName, value ? 'true' : 'false');
    }

    public minimize() {
        this.setMinimized(true);
    }

    public expand() {
        this.setMinimized(false);
    }

    public toggleMinimized() {
        this.setMinimized(!this.minimized);
    }

    /**
     * Get the stored minimized status
     */
    public getMinimizedStatus(): boolean {
        const value = this.sessionStorage.getItem(this.minimizedStorageKeyWithName);

        return value === null ? false : value === 'true';
    }

    /**
     * Get the stored opened status
     * Default on an opened status if nothing is stored
     */
    public getMenuOpenedStatus(): boolean {
        const value = this.sessionStorage.getItem(this.openedStorageKeyWithName);

        return value === null || value === 'true';
    }

    /**
     * Toggle menu but expand it if mobile mode is activated
     * Stores the status in local storage
     */
    public toggle() {
        this.setOpened(!this.opened);
    }

    public close() {
        this.setOpened(false);
    }

    public open() {
        this.setOpened(true);
    }

    public setOpened(value: boolean) {
        this.opened = value;

        if (this.opened && this.isMobileView()) {
            this.minimized = false;

        } else if (!this.isMobileView()) {
            this.sessionStorage.setItem(this.openedStorageKeyWithName, this.opened ? 'true' : 'false');
        }
    }

}
