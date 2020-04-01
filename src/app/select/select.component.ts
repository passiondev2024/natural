import { Component, OnInit } from '@angular/core';
import { NaturalHierarchicConfiguration } from '@ecodev/natural';
import { AnyService } from '../../../projects/natural/src/lib/testing/any.service';
import { ErrorService } from '../../../projects/natural/src/lib/testing/error.service';

@Component({
    selector: 'app-select',
    templateUrl: './select.component.html',
    styleUrls: ['./select.component.scss'],
})
export class SelectComponent implements OnInit {

    public pretext;

    public hierarchicConfig: NaturalHierarchicConfiguration[] = [
        {
            service: AnyService,
            parentsRelationNames: ['parent'],
            childrenRelationNames: ['parent'],
            selectableAtKey: 'any',
        },
    ];

    constructor(
        public service: AnyService,
        public errorService: ErrorService,
    ) {
    }

    ngOnInit() {
    }

}
