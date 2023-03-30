import {Component, Injector, OnInit} from '@angular/core';
import {AvailableColumn, NaturalAbstractList, Sorting, SortingOrder} from '@ecodev/natural';
import {ItemService} from '../../../projects/natural/src/lib/testing/item.service';

@Component({
    selector: 'app-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.scss'],
})
export class ListComponent extends NaturalAbstractList<ItemService> implements OnInit {
    public override readonly pageSizeOptions = [1, 2, 3, 4, 5];
    public override availableColumns: AvailableColumn[] = [
        {
            id: 'select',
            label: 'select',
        },
        {
            id: 'id',
            label: 'id',
            checked: false,
        },
        {
            id: 'name',
            label: 'name',
        },
        {
            id: 'description',
            label: 'description',
        },
        {
            id: 'hidden',
            label: 'hidden in menu',
            hidden: true,
        },
    ];

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
