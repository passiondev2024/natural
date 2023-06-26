import {Component, OnInit} from '@angular/core';
import {NaturalAbstractDetail, NaturalHierarchicConfiguration} from '@ecodev/natural';
import {ItemService} from '../../../projects/natural/src/lib/testing/item.service';
import {ErrorService} from '../../../projects/natural/src/lib/testing/error.service';
import {NoResultService} from '../../../projects/natural/src/lib/testing/no-result.service';

@Component({
    selector: 'app-relations',
    templateUrl: './relations.component.html',
    styleUrls: ['./relations.component.scss'],
})
export class RelationsComponent extends NaturalAbstractDetail<ItemService> implements OnInit {
    public hierarchicConfig: NaturalHierarchicConfiguration[] = [
        {
            service: ItemService,
            parentsRelationNames: ['parent'],
            childrenRelationNames: ['parent'],
            selectableAtKey: 'any',
        },
    ];

    public constructor(
        service: ItemService,
        public readonly noResultService: NoResultService,
        public readonly errorService: ErrorService,
    ) {
        super('any', service);
    }

    public relationsAdded(val: string): void {
        console.log('Relations added', val);
    }
}
