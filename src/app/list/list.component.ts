import {Component, Injector, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {NaturalAbstractList, Sorting, SortingOrder} from '@ecodev/natural';
import {AnyService} from '../../../projects/natural/src/lib/testing/any.service';

@Component({
    selector: 'app-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.scss'],
})
export class ListComponent extends NaturalAbstractList<AnyService> implements OnInit {
    public readonly pageSizeOptions = [1, 2, 3, 4, 5];

    protected defaultPagination = {
        offset: null,
        pageIndex: 0,
        pageSize: 5,
    };

    protected defaultSorting: Array<Sorting> = [{field: 'name', order: SortingOrder.DESC}];

    public constructor(service: AnyService, injector: Injector, public readonly route: ActivatedRoute) {
        super(service, injector);
    }
}
