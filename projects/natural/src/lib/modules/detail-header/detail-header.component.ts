import { Component, Input } from '@angular/core';
import { Literal } from '../../types/types';

@Component({
    selector: 'natural-detail-header',
    templateUrl: './detail-header.component.html',
    styleUrls: ['./detail-header.component.scss'],
})
export class NaturalDetailHeaderComponent {

    @Input() currentBaseUrl;
    @Input() isPanel = false;
    @Input() type = '';
    @Input() label = '';
    @Input() rootLabel = '';
    @Input() newLabel = '';
    @Input() model: Literal;
    @Input() breadcrumbs: Literal[] = [];
    @Input() listRoute: any[] = [];
    @Input() link: (id) => any[];

    public getRootLink(): string[] {
        return [this.currentBaseUrl || '/'].concat(this.listRoute);
    }

    public getLink(id): any[] {

        if (this.link) {
            return this.getRootLink().concat(this.link(id));
        }

        return this.getRootLink().concat([id]);
    }

}
