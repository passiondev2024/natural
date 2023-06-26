import {Component, OnInit} from '@angular/core';
import {collectErrors, NaturalAbstractDetail} from '@ecodev/natural';
import {ItemService} from '../../../projects/natural/src/lib/testing/item.service';

@Component({
    selector: 'app-detail',
    templateUrl: './detail.component.html',
    styleUrls: ['./detail.component.scss'],
})
export class DetailComponent extends NaturalAbstractDetail<ItemService> implements OnInit {
    public readonly collectErrors = collectErrors;

    public constructor(service: ItemService) {
        super('detail', service);
    }
}
