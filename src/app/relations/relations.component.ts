import { Component, Injector, OnInit } from '@angular/core';
import { NaturalAbstractDetail, NaturalHierarchicConfiguration } from '@ecodev/natural';
import { AnyService } from '../../../projects/natural/src/lib/testing/any.service';

@Component({
    selector: 'app-relations',
    templateUrl: './relations.component.html',
    styleUrls: ['./relations.component.scss'],
})
export class RelationsComponent extends NaturalAbstractDetail<any, any, any, any, any, any, any> implements OnInit {

    public hierarchicConfig: NaturalHierarchicConfiguration[] = [
        {
            service: AnyService,
            parentsFilters: ['parent'],
            childrenFilters: ['parent'],
            selectableAtKey: 'any',
        },
    ];

    constructor(public service: AnyService, injector: Injector) {
        super('any', service, injector);
    }

    public changed(val) {
        console.log('Changed', val);
    }

}
