import {Component} from '@angular/core';
import {NaturalHierarchicConfiguration} from '@ecodev/natural';
import {AnyService} from '../../../projects/natural/src/lib/testing/any.service';
import {ErrorService} from '../../../projects/natural/src/lib/testing/error.service';
import {AbstractSelect} from '../AbstractSelect';

@Component({
    templateUrl: './select-hierarchic.component.html',
    styleUrls: ['./select-hierarchic.component.scss'],
})
export class SelectHierarchicComponent extends AbstractSelect {
    public hierarchicConfig: NaturalHierarchicConfiguration[] = [
        {
            service: AnyService,
            parentsRelationNames: ['parent'],
            childrenRelationNames: ['parent'],
            selectableAtKey: 'any',
        },
    ];

    constructor(public readonly service: AnyService, public readonly errorService: ErrorService) {
        super(service, errorService);
    }
}
