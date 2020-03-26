import { Component } from '@angular/core';

@Component({
    selector: 'natural-sidenav-content',
    template: '<ng-content></ng-content>',
    styleUrls: ['./sidenav-content.component.scss'],
})
export class NaturalSidenavContentComponent {

    constructor() {
    }

}
