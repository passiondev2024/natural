import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
    DropdownFacet,
    Filter,
    fromUrl,
    NaturalSearchFacets,
    NaturalSearchSelections,
    toGraphQLDoctrineFilter,
    toUrl,
    TypeDateComponent,
    TypeDateRangeComponent,
    TypeHierarchicSelectorComponent,
    TypeHierarchicSelectorConfiguration,
    TypeNaturalSelectComponent,
    TypeNumberComponent,
    TypeSelectComponent,
    TypeSelectConfiguration,
    TypeTextComponent,
} from '@ecodev/natural';
import { timer } from 'rxjs';
import { map } from 'rxjs/operators';
import { AnyService } from '../../../projects/natural/src/lib/testing/any.service';

@Component({
    selector: 'app-search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit {

    public facets1: NaturalSearchFacets = [
        {
            display: 'Date',
            field: 'date',
            showValidateButton: true,
            component: TypeDateComponent,
        },
        {
            display: 'Date range',
            field: 'date',
            name: 'dateRange',
            showValidateButton: true,
            component: TypeDateRangeComponent,
        },
        {
            display: 'Artist',
            field: 'artist.name',
            showValidateButton: true,
            component: TypeTextComponent,
        },
        {
            display: 'Number',
            field: 'number',
            showValidateButton: true,
            component: TypeNumberComponent,
        },
        {
            display: 'Same field number',
            field: 'sameField',
            name: 'sameFieldNumber',
            showValidateButton: true,
            component: TypeNumberComponent,
        },
        {
            display: 'Same field string',
            field: 'sameField',
            name: 'sameFieldString',
            showValidateButton: true,
            component: TypeTextComponent,
        },
        {
            display: 'Hierarchic',
            field: 'hierarchic',
            showValidateButton: true,
            component: TypeHierarchicSelectorComponent,
            configuration: {
                key: 'any',
                service: this.anyService,
                config: [
                    {
                        service: AnyService,
                        parentsRelationNames: ['parent'],
                        childrenRelationNames: ['parent'],
                        selectableAtKey: 'any',
                    },
                ],
            } as TypeHierarchicSelectorConfiguration,
        },
        {
            display: 'Select single',
            field: 'single',
            component: TypeSelectComponent,
            configuration: {
                items: [
                    {id: 1, name: 'Option A'},
                    {id: 2, name: 'Option B'},
                    {id: 3, name: 'Option C'},
                ],
                multiple: false,
            },
        } as DropdownFacet<TypeSelectConfiguration>,
        {
            display: 'Overflow menu',
            field: 'overflow',
            component: TypeSelectComponent,
            showValidateButton: true,
            configuration: {
                items: [
                    {id: 1, name: 'Option A'},
                    {id: 2, name: 'Option B'},
                    {id: 3, name: 'Option C'},
                    {id: 1, name: 'Option A'},
                    {id: 2, name: 'Option B'},
                    {id: 3, name: 'Option C'},
                    {id: 1, name: 'Option A'},
                    {id: 2, name: 'Option B'},
                    {id: 3, name: 'Option C'},
                    {id: 1, name: 'Option A'},
                    {id: 2, name: 'Option B'},
                    {id: 3, name: 'Option C'},
                    {id: 1, name: 'Option A'},
                    {id: 2, name: 'Option B'},
                    {id: 3, name: 'Option C'},
                    {id: 1, name: 'Option A'},
                    {id: 2, name: 'Option B'},
                    {id: 3, name: 'Option C'},
                    {id: 1, name: 'Option A'},
                    {id: 2, name: 'Option B'},
                    {id: 3, name: 'Option C'},
                    {id: 1, name: 'Option A'},
                    {id: 2, name: 'Option B'},
                    {id: 3, name: 'Option C'},
                    {id: 1, name: 'Option A'},
                    {id: 2, name: 'One before last option'},
                    {id: 3, name: 'Last option'},
                ],
                multiple: false,
            },
        },
        {
            display: 'Select multiple',
            field: 'multiple',
            component: TypeSelectComponent,
            showValidateButton: true,
            configuration: {
                items: [
                    {id: 1, name: 'Option A'},
                    {id: 2, name: 'Option B'},
                    {id: 3, name: 'Option C'},
                ],
                multiple: true,
            },
        },
        {
            display: 'Select 2s delayed',
            field: 'delayed',
            component: TypeSelectComponent,
            showValidateButton: true,
            configuration: {
                items: timer(2000).pipe(map(() => [
                        {id: 1, name: 'Option A'},
                        {id: 2, name: 'Option B'},
                        {id: 3, name: 'Option C'},
                    ],
                )),
                multiple: true,
            },
        },
        {
            display: 'Is published',
            field: 'published',
            condition: {equal: {value: true}},
        },
        {
            display: 'Include archives',
            field: 'archived',
            inversed: true,
            condition: {equal: {value: false}},
        },
        {
            display: 'Natural select',
            field: 'natural-select',
            component: TypeNaturalSelectComponent,
            configuration: {
                service: this.anyService,
                // placeholder: 'Natural select placeholder',
            },
        },
    ];

    public facets: NaturalSearchFacets | null = this.facets1;

    public facets2: NaturalSearchFacets = [
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

    public graphqlSelections: Filter;
    public selectionsDone: NaturalSearchSelections;
    public selections: NaturalSearchSelections = [
        [
            {
                field: 'delayed',
                condition: {in: {values: [1]}},
            },
            {
                field: 'single',
                condition: {in: {values: [2]}},
            },
            {
                field: 'overflow',
                condition: {in: {values: [2]}},
            },
            {
                field: 'artist.name',
                condition: {like: {value: 'picasso'}},
            },
            {
                field: 'number',
                condition: {equal: {value: 123}},
            },
            {
                field: 'archived',
                condition: {equal: {value: 'true'}},
            },
            {
                field: 'unsued',
                condition: {equal: {value: 'unused value'}},
            },
            {
                field: 'search',
                condition: {like: {value: 'searched'}},
            },
            {
                field: 'sameField',
                name: 'sameFieldNumber',
                condition: {equal: {value: 123}},
            },
        ],
    ];

    constructor(private router: Router,
                private route: ActivatedRoute,
                public anyService: AnyService) {
    }

    ngOnInit() {

        const params = this.route.snapshot.params.search;
        if (params) {
            this.selections = fromUrl(params);
        }

    }

    public updateFilter(selections: NaturalSearchSelections): void {
        this.graphqlSelections = toGraphQLDoctrineFilter(this.facets, selections);

        const params = {search: toUrl(selections)};
        this.router.navigate(['.'], {
            relativeTo: this.route,
            queryParams: params,
        });
    }

    public stringify(s): string {
        return JSON.stringify(s);
    }

    public toUrl(selections: NaturalSearchSelections): string | null {
        return toUrl(selections);
    }

}
