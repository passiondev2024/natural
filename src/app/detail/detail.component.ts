import {Component, Injector, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {collectErrors, NaturalAbstractDetail} from '@ecodev/natural';
import {ItemService} from '../../../projects/natural/src/lib/testing/item.service';

@Component({
    selector: 'app-detail',
    templateUrl: './detail.component.html',
    styleUrls: ['./detail.component.scss'],
})
export class DetailComponent extends NaturalAbstractDetail<ItemService> implements OnInit {
    public collectErrors = collectErrors;

    public constructor(service: ItemService, injector: Injector, public readonly route: ActivatedRoute) {
        super('detail', service, injector);
    }
}
