import {CommonModule} from '@angular/common';
import {Component, OnInit} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {ActivatedRoute, Router} from '@angular/router';
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
import {FlexModule} from '@ngbracket/ngx-layout/flex';
import {timer} from 'rxjs';
import {map} from 'rxjs/operators';
import {TypeBooleanComponent} from '../../../projects/natural/src/lib/modules/dropdown-components/type-boolean/type-boolean.component';
import {TypeOptionsComponent} from '../../../projects/natural/src/lib/modules/dropdown-components/type-options/type-options.component';
import {NaturalSearchComponent} from '../../../projects/natural/src/lib/modules/search/search/search.component';
import {ErrorService} from '../../../projects/natural/src/lib/testing/error.service';
import {ItemService} from '../../../projects/natural/src/lib/testing/item.service';

@Component({
    selector: 'app-search',
    templateUrl: './search.component.html',
    styleUrl: './search.component.scss',
    standalone: true,
    imports: [FlexModule, NaturalSearchComponent, MatButtonModule, CommonModule],
})
export class SearchComponent implements OnInit {
    public facets1: NaturalSearchFacets = [
        {
            display: 'Active',
            field: 'isActive',
            component: TypeBooleanComponent,
            showValidateButton: false,
            configuration: {
                displayWhenActive: 'Actives',
                displayWhenInactive: 'Inactives',
            },
        },
        {
            display: 'Options / Facets',
            field: 'isFlagged',
            component: TypeOptionsComponent,
            showValidateButton: false,
            configuration: {
                options: [
                    {
                        display: 'Is active',
                        condition: {equal: {value: true}},
                    },
                    {
                        display: 'Is inactive',
                        condition: {equal: {value: true}},
                    },
                    {
                        display: 'Is not defined',
                        condition: {null: {}},
                    },
                    {
                        display: 'Is defined',
                        condition: {null: {not: true}},
                    },
                ],
            },
        },
        {
            display: 'Date',
            field: 'date',
            component: TypeDateComponent,
        },
        {
            display: 'Date range',
            field: 'date',
            name: 'dateRange',
            component: TypeDateRangeComponent,
        },
        {
            display: 'Artist',
            field: 'artist.name',
            component: TypeTextComponent,
        },
        {
            display: 'Number',
            field: 'number',
            component: TypeNumberComponent,
        },
        {
            display: 'Same field number',
            field: 'sameField',
            name: 'sameFieldNumber',
            component: TypeNumberComponent,
        },
        {
            display: 'Same field string',
            field: 'sameField',
            name: 'sameFieldString',
            component: TypeTextComponent,
        },
        {
            display: 'Hierarchic',
            field: 'hierarchic',
            component: TypeHierarchicSelectorComponent,
            configuration: {
                key: 'any',
                service: this.itemService,
                config: [
                    {
                        service: ItemService,
                        parentsRelationNames: ['parent'],
                        childrenRelationNames: ['parent'],
                        selectableAtKey: 'any',
                    },
                ],
            } satisfies TypeHierarchicSelectorConfiguration,
        },
        {
            display: 'Hierarchic with error',
            field: 'hierarchic-with-error',
            component: TypeHierarchicSelectorComponent,
            configuration: {
                key: 'any',
                service: this.errorService,
                config: [
                    {
                        service: ErrorService,
                        parentsRelationNames: ['parent'],
                        childrenRelationNames: ['parent'],
                        selectableAtKey: 'any',
                    },
                ],
            } satisfies TypeHierarchicSelectorConfiguration,
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
        } satisfies DropdownFacet<TypeSelectConfiguration>,
        {
            display: 'Overflow menu',
            field: 'overflow',
            component: TypeSelectComponent,
            configuration: {
                items: [
                    {id: 1, name: 'Option A'},
                    {id: 2, name: 'Option B'},
                    {id: 3, name: 'Option C'},
                    {id: 4, name: 'Option D'},
                    {id: 5, name: 'Option E'},
                    {id: 6, name: 'Option F'},
                    {id: 7, name: 'Option G'},
                    {id: 8, name: 'Option H'},
                    {id: 9, name: 'Option I'},
                    {id: 10, name: 'Option J'},
                    {id: 11, name: 'Option K'},
                    {id: 12, name: 'Option L'},
                    {id: 13, name: 'Option M'},
                    {id: 14, name: 'Option N'},
                    {id: 15, name: 'Option O'},
                    {id: 16, name: 'Option P'},
                    {id: 17, name: 'Option Q'},
                    {id: 18, name: 'Option R'},
                    {id: 19, name: 'Option S'},
                    {id: 20, name: 'Option T'},
                    {id: 21, name: 'Option U'},
                    {id: 22, name: 'Option V'},
                    {id: 23, name: 'Option W'},
                    {id: 24, name: 'Option X'},
                    {id: 25, name: 'Option Y'},
                    {id: 26, name: 'Option Z'},
                    {id: 27, name: 'One before last option'},
                    {id: 28, name: 'Last option'},
                ],
                multiple: false,
            },
        },
        {
            display: 'Select multiple',
            field: 'multiple',
            component: TypeSelectComponent,
            configuration: {
                items: [
                    {id: 1, name: 'Option A asd fasdfasd fasdfadfa as asd afd asd fas fasf ad fasf asfas'},
                    {id: 2, name: 'Option B asd fasdfasd fasdfadfa as asd afd asd fas fasf ad fasf asfas'},
                    {id: 3, name: 'Option C asd fasdfasd fasdfadfa as asd afd asd fas fasf ad fasf asfas'},
                ],
                multiple: true,
            },
        },
        {
            display: 'Select 2s delayed',
            field: 'delayed',
            component: TypeSelectComponent,
            configuration: {
                items: timer(2000).pipe(
                    map(() => [
                        {id: 1, name: 'Option A'},
                        {id: 2, name: 'Option B'},
                        {id: 3, name: 'Option C'},
                    ]),
                ),
                multiple: true,
            },
        },
        {
            display: 'Select without operators',
            field: 'nooperator',
            component: TypeSelectComponent,
            configuration: {
                items: [
                    {id: 1, name: 'Option A'},
                    {id: 2, name: 'Option B'},
                    {id: 3, name: 'Option C'},
                ],
                operators: false,
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
                service: this.itemService,
                // placeholder: 'Natural select placeholder',
            },
        },
        {
            display: 'Natural select with error',
            field: 'natural-select-with-error',
            component: TypeNaturalSelectComponent,
            configuration: {
                service: this.errorService,
            },
        },
    ];

    public facets: NaturalSearchFacets = this.facets1;

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

    public graphqlSelections: Filter = {};
    public selectionsDone?: NaturalSearchSelections;
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
            {
                field: 'multiple',
                condition: {in: {values: [1, 2]}},
            },
        ],
    ];

    public constructor(
        private readonly router: Router,
        private readonly route: ActivatedRoute,
        public readonly itemService: ItemService,
        public readonly errorService: ErrorService,
    ) {}

    public ngOnInit(): void {
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

    public stringify(s: any): string {
        return JSON.stringify(s);
    }

    public toUrl(selections: NaturalSearchSelections): string | null {
        return toUrl(selections);
    }
}
