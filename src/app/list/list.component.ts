import {Component, Injector, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {NaturalAbstractList, Sorting, SortingOrder} from '@ecodev/natural';
import {ItemService} from '../../../projects/natural/src/lib/testing/item.service';

@Component({
    selector: 'app-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.scss'],
})
export class ListComponent extends NaturalAbstractList<ItemService> implements OnInit {
    public readonly pageSizeOptions = [1, 2, 3, 4, 5];

    protected defaultPagination = {
        offset: null,
        pageIndex: 0,
        pageSize: 5,
    };

    protected defaultSorting: Array<Sorting> = [{field: 'name', order: SortingOrder.DESC}];

    public constructor(service: ItemService, injector: Injector, public readonly route: ActivatedRoute) {
        super(service, injector);
    }
}
