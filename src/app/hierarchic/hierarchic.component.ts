import {Component, OnInit} from '@angular/core';
import {
    HierarchicDialogConfig,
    NaturalHierarchicConfiguration,
    NaturalHierarchicSelectorDialogService,
    NaturalSearchFacets,
    NaturalSearchSelections,
    OrganizedModelSelection,
    TypeNumberComponent,
} from '@ecodev/natural';
import {AnyService} from '../../../projects/natural/src/lib/testing/any.service';

@Component({
    selector: 'app-hierarchic',
    templateUrl: './hierarchic.component.html',
    styleUrls: ['./hierarchic.component.scss'],
})
export class HierarchicComponent implements OnInit {
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
            service: AnyService,
            parentsRelationNames: ['parent'],
            childrenRelationNames: ['parent'],
            selectableAtKey: 'any',
        },
    ];

    constructor(private readonly hierarchicDialogService: NaturalHierarchicSelectorDialogService) {}

    public ngOnInit(): void {}

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
