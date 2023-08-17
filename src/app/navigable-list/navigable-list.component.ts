import {Component, OnInit} from '@angular/core';
import {AvailableColumn, NaturalAbstractNavigableList, Sorting, SortingOrder} from '@ecodev/natural';
import {ItemService} from '../../../projects/natural/src/lib/testing/item.service';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatTooltipModule} from '@angular/material/tooltip';
import {NaturalTableButtonComponent} from '../../../projects/natural/src/lib/modules/table-button/table-button.component';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatSortModule} from '@angular/material/sort';
import {MatTableModule} from '@angular/material/table';
import {NaturalColumnsPickerComponent} from '../../../projects/natural/src/lib/modules/columns-picker/columns-picker.component';
import {NaturalSearchComponent} from '../../../projects/natural/src/lib/modules/search/search/search.component';
import {NaturalIconDirective} from '../../../projects/natural/src/lib/modules/icon/icon.directive';
import {MatIconModule} from '@angular/material/icon';
import {RouterLink} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {FlexModule} from '@ngbracket/ngx-layout/flex';
import {CommonModule} from '@angular/common';

@Component({
    selector: 'app-navigable-list',
    templateUrl: './navigable-list.component.html',
    styleUrls: ['./navigable-list.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        FlexModule,
        MatButtonModule,
        RouterLink,
        MatIconModule,
        NaturalIconDirective,
        NaturalSearchComponent,
        NaturalColumnsPickerComponent,
        MatTableModule,
        MatSortModule,
        MatCheckboxModule,
        NaturalTableButtonComponent,
        MatTooltipModule,
        MatProgressSpinnerModule,
        MatPaginatorModule,
    ],
})
export class NavigableListComponent extends NaturalAbstractNavigableList<ItemService> implements OnInit {
    protected override defaultPagination = {
        offset: null,
        pageIndex: 0,
        pageSize: 5,
    };
    public override availableColumns: AvailableColumn[] = [
        {
            id: 'select',
            label: 'select',
        },
        {
            id: 'navigation',
            label: 'navigation',
        },
        {
            id: 'name',
            label: 'name',
        },
        {
            id: 'description',
            label: 'description',
        },
    ];
    protected override defaultSorting: Array<Sorting> = [{field: 'name', order: SortingOrder.DESC}];

    public constructor(service: ItemService) {
        super(service);
    }
}
