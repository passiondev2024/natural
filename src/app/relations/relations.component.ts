import {Component, Injector, OnInit} from '@angular/core';
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
        public readonly service: ItemService,
        public readonly noResultService: NoResultService,
        public readonly errorService: ErrorService,
        injector: Injector,
    ) {
        super('any', service, injector);
    }

    public changed(val: string): void {
        console.log('Changed', val);
    }
}
