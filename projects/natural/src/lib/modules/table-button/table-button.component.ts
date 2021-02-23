import {Component, Input, ViewEncapsulation} from '@angular/core';
import {QueryParamsHandling, RouterLink} from '@angular/router';
import {ThemePalette} from '@angular/material/core';

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
    @Input() public queryParams: {
        [k: string]: any;
    } = {};
    @Input() public queryParamsHandling: QueryParamsHandling = '';
    @Input() public label?: string | null;
    @Input() public icon?: string | null;
    @Input() public href?: string | null;
    @Input() public navigate: RouterLink['routerLink'] = [];
    @Input() public fragment?: string | undefined;
    @Input() public preserveFragment = false;
    @Input() public raised = false;
    @Input() public color: ThemePalette;

    constructor() {}
}
