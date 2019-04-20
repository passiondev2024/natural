import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
    Filter,
    fromUrl,
    NaturalSearchConfiguration,
    NaturalSearchSelections,
    toGraphQLDoctrineFilter,
    toUrl,
    TypeDateRangeComponent,
    TypeNumericComponent,
    TypeNumericRangeComponent,
    TypeSelectComponent,
} from '@ecodev/natural';
import { timer } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
    selector: 'app-search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit {

    public config1: NaturalSearchConfiguration = [
        {
            display: 'Date range',
            field: 'date',
            component: TypeDateRangeComponent,
        },
        {
            display: 'Artist',
            field: 'artist.name',
        },
        {
            display: 'Number',
            field: 'number',
            component: TypeNumericComponent,
        },
        {
            display: 'Same field number',
            field: 'sameField',
            name: 'sameFieldNumber',
            component: TypeNumericComponent,
        },
        {
            display: 'Same field string',
            field: 'sameField',
            name: 'sameFieldString',
        },
        {
            display: 'Numeric range',
            field: 'range',
            component: TypeNumericRangeComponent,
        },
        {
            display: 'Select single',
            field: 'single',
            component: TypeSelectComponent,
            configuration: {
                items: [
                    {
                        id: 1,
                        name: 'Option A',
                    },
                    {
                        id: 2,
                        name: 'Option B',
                    },
                    {
                        id: 3,
                        name: 'Option C',
                    },
                ],
                multiple: false,
            },
        },
        {
            display: 'Overflow menu',
            field: 'overflow',
            component: TypeSelectComponent,
            configuration: {
                items: [
                    {
                        id: 1,
                        name: 'Option A',
                    },
                    {
                        id: 2,
                        name: 'Option B',
                    },
                    {
                        id: 3,
                        name: 'Option C',
                    },
                    {
                        id: 1,
                        name: 'Option A',
                    },
                    {
                        id: 2,
                        name: 'Option B',
                    },
                    {
                        id: 3,
                        name: 'Option C',
                    },
                    {
                        id: 1,
                        name: 'Option A',
                    },
                    {
                        id: 2,
                        name: 'Option B',
                    },
                    {
                        id: 3,
                        name: 'Option C',
                    },
                    {
                        id: 1,
                        name: 'Option A',
                    },
                    {
                        id: 2,
                        name: 'Option B',
                    },
                    {
                        id: 3,
                        name: 'Option C',
                    },
                    {
                        id: 1,
                        name: 'Option A',
                    },
                    {
                        id: 2,
                        name: 'Option B',
                    },
                    {
                        id: 3,
                        name: 'Option C',
                    },
                    {
                        id: 1,
                        name: 'Option A',
                    },
                    {
                        id: 2,
                        name: 'Option B',
                    },
                    {
                        id: 3,
                        name: 'Option C',
                    },
                    {
                        id: 1,
                        name: 'Option A',
                    },
                    {
                        id: 2,
                        name: 'Option B',
                    },
                    {
                        id: 3,
                        name: 'Option C',
                    },
                    {
                        id: 1,
                        name: 'Option A',
                    },
                    {
                        id: 2,
                        name: 'Option B',
                    },
                    {
                        id: 3,
                        name: 'Option C',
                    },
                    {
                        id: 1,
                        name: 'Option A',
                    },
                    {
                        id: 2,
                        name: 'One before last option',
                    },
                    {
                        id: 3,
                        name: 'Last option',
                    },
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
                    {
                        id: 1,
                        name: 'Option A',
                    },
                    {
                        id: 2,
                        name: 'Option B',
                    },
                    {
                        id: 3,
                        name: 'Option C',
                    },
                ],
                multiple: true,
            },
        },
        {
            display: 'Select 2s delayed',
            field: 'delayed',
            component: TypeSelectComponent,
            configuration: {
                items: timer(2000).pipe(map(() => [
                        {
                            id: 1,
                            name: 'Option A',
                        },
                        {
                            id: 2,
                            name: 'Option B',
                        },
                        {
                            id: 3,
                            name: 'Option C',
                        },
                    ],
                )),
                multiple: true,
            },
        },
        {
            display: 'With archives',
            field: 'archived',
            condition: {
                equal: {value: true},
            },
        },
    ];

    public config: NaturalSearchConfiguration | null = this.config1;

    public config2: NaturalSearchConfiguration = [
        {
            display: 'Number',
            field: 'number',
            component: TypeNumericComponent,
            configuration: {
                max: 100,
            },
        },
        {
            display: 'With archives',
            field: 'archived',
            condition: {
                equal: {value: true},
            },
        },
    ];

    public graphqlSelections: Filter;
    public selectionsDone: NaturalSearchSelections;
    public selections: NaturalSearchSelections = [
        [
            {
                field: 'delayed',
                condition: {
                    in: {values: [1]},
                },
            },
            {
                field: 'single',
                condition: {
                    in: {values: [2]},
                },
            },
            {
                field: 'overflow',
                condition: {
                    in: {values: [2]},
                },
            },
            {
                field: 'artist.name',
                condition: {
                    like: {value: 'picasso'},
                },
            },
            {
                field: 'number',
                condition: {
                    equal: {value: 123},
                },
            },
            {
                field: 'archived',
                condition: {
                    equal: {value: 'true'},
                },
            },
            {
                field: 'unsued',
                condition: {
                    equal: {value: 'unused value'},
                },
            },
            {
                field: 'search',
                condition: {
                    like: {value: 'searched'},
                },
            },
            {
                field: 'sameField',
                name: 'sameFieldNumber',
                condition: {
                    equal: {value: 123},
                },
            },
        ],
    ];

    constructor(
        private router: Router,
        private route: ActivatedRoute) {
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
        this.graphqlSelections = toGraphQLDoctrineFilter(this.config, selections);

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
