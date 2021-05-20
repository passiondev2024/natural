import {Component, Input} from '@angular/core';
import {Literal} from '../../types/types';

@Component({
    selector: 'natural-detail-header',
    templateUrl: './detail-header.component.html',
    styleUrls: ['./detail-header.component.scss'],
})
export class NaturalDetailHeaderComponent {
    /**
     * Base URL used to build links, defaults to '/'
     */
    @Input() public currentBaseUrl?: string;

    /**
     * Must be set to get proper links when used in panels
     */
    @Input() public isPanel = false;

    /**
     * If given will show icon before title
     */
    @Input() public icon = '';
    /**
     * Title shown if model has no name, or empty name.
     *
     * Typically should be the human name for the object type, eg: 'Product'
     */
    @Input() public label = '';

    /**
     * Label of the root of the breadcrumb, defaults to the value of `label`.
     *
     * Typically should be the plural form of the object type, eg: 'Products'
     */
    @Input() public rootLabel = '';

    /**
     * Title shown if model has no id.
     *
     * Typically should be similar to 'New product'.
     */
    @Input() public newLabel = '';
    @Input() public model!: Literal;
    @Input() public breadcrumbs: Literal[] = [];
    @Input() public listRoute: any[] = [];
    @Input() public listFragment: string | undefined;
    @Input() public link?: (id: string) => any[];

    public getRootLink(): string[] {
        return [this.currentBaseUrl || '/'].concat(this.listRoute);
    }

    public getLink(id: string): any[] {
        if (this.link) {
            return this.getRootLink().concat(this.link(id));
        }

        return this.getRootLink().concat([id]);
    }
}
