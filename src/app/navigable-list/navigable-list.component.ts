import {Component, Injector, OnInit} from '@angular/core';
import {NaturalAbstractNavigableList, Sorting, SortingOrder} from '@ecodev/natural';
import {ItemService} from '../../../projects/natural/src/lib/testing/item.service';

@Component({
    selector: 'app-navigable-list',
    templateUrl: './navigable-list.component.html',
    styleUrls: ['./navigable-list.component.scss'],
})
export class NavigableListComponent extends NaturalAbstractNavigableList<ItemService> implements OnInit {
    protected override defaultPagination = {
        offset: null,
        pageIndex: 0,
        pageSize: 5,
    };

    protected override defaultSorting: Array<Sorting> = [{field: 'name', order: SortingOrder.DESC}];

    public constructor(service: ItemService, injector: Injector) {
        super(service, injector);
    }
}
