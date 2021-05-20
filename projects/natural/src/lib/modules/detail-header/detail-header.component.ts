import {Component, Input} from '@angular/core';
import {Literal} from '../../types/types';

@Component({
    selector: 'natural-detail-header',
    templateUrl: './detail-header.component.html',
    styleUrls: ['./detail-header.component.scss'],
})
export class NaturalDetailHeaderComponent {
    @Input() public currentBaseUrl?: string;
    @Input() public isPanel = false;
    @Input() public type = '';
    @Input() public label = '';
    @Input() public rootLabel = '';
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
