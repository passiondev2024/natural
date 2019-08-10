import { Component, Input, ViewEncapsulation } from '@angular/core';
import { QueryParamsHandling, RouterLink } from '@angular/router';

/**
 * Button that fits well in a `<mat-table>` and support either
 * route navigation via `navigate` or external URL via `href`.
 *
 * External URL will always be opened in new tab.
 */
@Component({
    selector: 'natural-table-button',
    templateUrl: './table-button.component.html',
    styleUrls: ['./table-button.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class NaturalTableButtonComponent {

    @Input() queryParams: {
        [k: string]: any;
    };
    @Input() queryParamsHandling: QueryParamsHandling;
    @Input() label: string;
    @Input() icon: string;
    @Input() href: string;
    @Input() navigate: RouterLink['routerLink'];
    @Input() raised: boolean;
    @Input() color: null | 'primary' | 'accent' | 'warn';

    constructor() {
    }
}
