import {Component} from '@angular/core';
import {
    HierarchicDialogConfig,
    NaturalHierarchicConfiguration,
    NaturalHierarchicSelectorDialogService,
    NaturalSearchFacets,
    NaturalSearchSelections,
    OrganizedModelSelection,
    TypeNumberComponent,
} from '@ecodev/natural';
import {ItemService} from '../../../projects/natural/src/lib/testing/item.service';
import {MatButtonModule} from '@angular/material/button';
import {NaturalHierarchicSelectorComponent} from '../../../projects/natural/src/lib/modules/hierarchic-selector/hierarchic-selector/hierarchic-selector.component';
import {FlexModule} from '@ngbracket/ngx-layout/flex';

@Component({
    selector: 'app-hierarchic',
    templateUrl: './hierarchic.component.html',
    styleUrls: ['./hierarchic.component.scss'],
    standalone: true,
    imports: [FlexModule, NaturalHierarchicSelectorComponent, MatButtonModule],
})
export class HierarchicComponent {
    public searchFacets: NaturalSearchFacets = [
        {
            display: 'Number less than 100',
            field: 'number',
            component: TypeNumberComponent,
            configuration: {
                max: 100,
            },
        },
        {
            display: 'With archives',
            field: 'archived',
            condition: {equal: {value: true}},
        },
    ];

    public searchSelections: NaturalSearchSelections = [
        [
            {
                field: 'number',
                condition: {equal: {value: 50}},
            },
        ],
    ];

    public selected: OrganizedModelSelection = {
        any: [
            {
                id: 123,
                name: 'Any 123',
            },
            {
                id: 124,
                name: 'Any 124',
            },
        ],
    };

    public config: NaturalHierarchicConfiguration[] = [
        {
            service: ItemService,
            parentsRelationNames: ['parent'],
            childrenRelationNames: ['parent'],
            selectableAtKey: 'any',
        },
    ];

    public constructor(private readonly hierarchicDialogService: NaturalHierarchicSelectorDialogService) {}

    public log(...args: any): void {
        console.log(args);
    }

    public select(): void {
        const hierarchicConfig: HierarchicDialogConfig = {
            hierarchicConfig: this.config,
            hierarchicSelection: this.selected,
            searchFacets: this.searchFacets,
            searchSelections: this.searchSelections,
        };

        this.hierarchicDialogService
            .open(hierarchicConfig)
            .afterClosed()
            .subscribe(result => {
                this.log('dialog usage', result);
            });
    }
}
