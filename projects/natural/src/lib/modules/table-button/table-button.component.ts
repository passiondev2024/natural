import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewEncapsulation} from '@angular/core';
import {Params, QueryParamsHandling, RouterLink} from '@angular/router';
import {ThemePalette} from '@angular/material/core';

/**
 * Button that fits well in a `<mat-table>` and support either
 * route navigation via `navigate` or external URL via `href`.
 *
 * If neither `navigate` nor `href` has a meaningful value, then
 * it will show the icon and/or label in `<span>` instead of a button
 *
 * External URL will always be opened in new tab.
 */
@Component({
    selector: 'natural-table-button',
    templateUrl: './table-button.component.html',
    styleUrls: ['./table-button.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class NaturalTableButtonComponent implements OnChanges {
    @Input() public queryParams: Params = {};
    @Input() public queryParamsHandling: QueryParamsHandling = '';
    @Input() public label?: string | null;
    @Input() public icon?: string | null;
    @Input() public href?: string | null;
    @Input() public navigate: RouterLink['routerLink'] = [];
    @Input() public fragment?: string | undefined;
    @Input() public preserveFragment = false;
    @Input() public raised = false;
    @Input() public color: ThemePalette;
    @Output() public readonly buttonClick = new EventEmitter<MouseEvent>();
    public type: 'routerLink' | 'href' | 'click' | 'none' = 'none';

    public ngOnChanges(changes: SimpleChanges): void {
        if (this.navigate?.length || Object.keys(this.queryParams).length) {
            this.type = 'routerLink';
        } else if (this.href) {
            this.type = 'href';
        } else if (this.buttonClick.observed) {
            this.type = 'click';
        } else {
            this.type = 'none';
        }
    }
}
