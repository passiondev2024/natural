import { Component, HostBinding, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSidenav, MatSidenavContainer } from '@angular/material';
import { NaturalSidenavService } from '../sidenav.service';

@Component({
    selector: 'natural-sidenav-container',
    templateUrl: './sidenav-container.component.html',
    styleUrls: ['./sidenav-container.component.scss'],
    providers: [NaturalSidenavService],
})
export class NaturalSidenavContainerComponent implements OnInit, OnDestroy {

    @Input() name: string;
    @ViewChild(MatSidenavContainer) private menuContainer: MatSidenavContainer;
    @ViewChild(MatSidenav) private menuSidenav: MatSidenav;
    @HostBinding('attr.no-scroll') @Input() public noScroll: boolean;

    constructor(public naturalSidenavService: NaturalSidenavService) {
    }

    ngOnInit() {
        this.naturalSidenavService.init(this.name, this.menuContainer, this.menuSidenav, this);
    }

    ngOnDestroy() {
        this.naturalSidenavService.destroy(this.name);
    }

    public toggle() {
        this.naturalSidenavService.toggle();
    }

}
