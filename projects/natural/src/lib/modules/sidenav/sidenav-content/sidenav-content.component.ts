import {Component} from '@angular/core';

@Component({
    selector: 'natural-sidenav-content',
    template: '<ng-content />',
    styleUrl: './sidenav-content.component.scss',
    standalone: true,
})
export class NaturalSidenavContentComponent {}
