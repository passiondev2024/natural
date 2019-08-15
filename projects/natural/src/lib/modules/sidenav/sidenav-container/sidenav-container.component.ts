import { Component, ElementRef, HostBinding, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSidenav, MatSidenavContainer } from '@angular/material/sidenav';
import { NaturalSidenavService } from '../sidenav.service';

@Component({
    selector: 'natural-sidenav-container',
    templateUrl: './sidenav-container.component.html',
    styleUrls: ['./sidenav-container.component.scss'],
    providers: [NaturalSidenavService],
})
export class NaturalSidenavContainerComponent implements OnInit, OnDestroy {

    /**
     * Unique identifier used for the local storage and to recover the component from NaturalSidenavService.sideNavs static property
     */
    @Input() name: string;

    /**
     * If true listens to route changes to close side nav after a route change if mobile view is active
     * Actually a navigation to current route does not emit a route change, and the sidenav don't close.
     */
    @Input() mobileAutoClose = true;

    /**
     * Width of the minimized menu
     */
    @Input() minimizedWidth = 150;

    /**
     * If true, prevents "native" material sidenav to scroll at container level and delegates the scroll responsability to the transcluded
     * content
     */
    @HostBinding('attr.no-scroll') @Input() public noScroll: boolean;

    /**
     * Inner "native" material sidenav container
     */
    @ViewChild(MatSidenavContainer, {static: true}) private menuContainer: MatSidenavContainer;

    /**
     * Inner "native" material sidenav
     */
    @ViewChild(MatSidenav, {static: true}) private menuSidenav: MatSidenav;

    constructor(public sidenavService: NaturalSidenavService, public element: ElementRef) {
    }

    public get isMinimized(): boolean {
        return this.sidenavService.isMinimized;
    }

    public get isMobileView(): boolean {
        return this.sidenavService.isMobileView();
    }

    ngOnInit() {
        this.sidenavService.init(this.name, this.menuContainer, this.menuSidenav, this, this.mobileAutoClose);
    }

    ngOnDestroy() {
        this.sidenavService.destroy(this.name);
    }

    public toggle() {
        this.sidenavService.toggle();
    }

    public close() {
        this.sidenavService.close();
    }

    public open() {
        this.sidenavService.open();
    }

    public minimize() {
        this.sidenavService.minimize();
    }

    public expand() {
        this.sidenavService.expand();
    }

    public toggleMinimized() {
        this.sidenavService.toggleMinimized();
    }

}
