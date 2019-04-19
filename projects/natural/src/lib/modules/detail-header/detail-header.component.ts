import { Component, Input, OnInit } from '@angular/core';
import { Literal } from '../../types/types';

@Component({
    selector: 'natural-detail-header',
    templateUrl: './detail-header.component.html',
})
export class NaturalDetailHeaderComponent implements OnInit {

    @Input() type = '';
    @Input() label = '';
    @Input() rootLabel = '';
    @Input() newLabel = '';
    @Input() model: Literal;
    @Input() breadcrumbs: Literal[] = [];
    @Input() listRoute: any[] = [];
    @Input() link: (id) => any[];

    constructor() {
    }

    ngOnInit() {
    }

    public getRootLink(): string[] {
        return ['/'].concat(this.listRoute);
    }

    public getLink(id): any[] {

        if (this.link) {
            return this.getRootLink().concat(this.link(id));
        }

        return this.getRootLink().concat([id]);
    }

}
