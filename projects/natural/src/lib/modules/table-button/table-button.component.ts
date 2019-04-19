import { Component, Input, ViewEncapsulation } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'natural-table-button',
    templateUrl: './table-button.component.html',
    styleUrls: ['./table-button.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class NaturalTableButtonComponent {

    @Input() queryParams: any;
    @Input() queryParamsHandling: any;
    @Input() label: string;
    @Input() icon: string;
    @Input() href: string;
    @Input() navigate: RouterLink['routerLink'];

    constructor() {
    }
}
