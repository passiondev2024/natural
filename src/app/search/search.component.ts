import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
    Filter,
    fromUrl,
    NaturalSearchFacets,
    NaturalSearchSelections,
    toGraphQLDoctrineFilter,
    toUrl,
    TypeDateComponent, TypeNaturalSelectComponent,
    TypeNumberComponent,
    TypeSelectComponent,
    TypeHierarchicSelectorConfiguration,
    TypeHierarchicSelectorComponent,
    TypeTextComponent, DropdownFacet, TypeSelectConfiguration,
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
                        parentsFilters: ['parent'],
                        childrenFilters: ['parent'],
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
            display: 'With archives',
            field: 'archived',
            condition: {equal: {value: true}},
        },
        {
            display: 'Natural select',
            field: 'natural-select',
            component: TypeNaturalSelectComponent,
            configuration: {
                service: this.anyService,
                // placeholder: 'Natural select placeholder',
            },
        }
    ];

    public facets: NaturalSearchFacets | null = this.facets1;

    public facets2: NaturalSearchFacets = [
        {
            display: 'Number',
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

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        public anyService: AnyService,
    ) {
    }

    ngOnInit() {

        // Load search from URL exactly one time
        const subscription = this.route.queryParams.subscribe(params => {
            const param = params['search'];
            if (param) {
                this.selections = fromUrl(param);
                if (subscription) {
                    subscription.unsubscribe();
                }
            }
        });
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
