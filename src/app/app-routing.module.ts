import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NaturalPanelsComponent, NaturalPanelsUrlMatcher } from '@ecodev/natural';
import { AnyResolver } from '../../projects/natural/src/lib/testing/any.resolver';
import { EditableListComponent } from './editable-list/editable-list.component';
import { HierarchicComponent } from './hierarchic/hierarchic.component';
import { HomeComponent } from './home/home.component';
import { HomepageComponent } from './homepage/homepage.component';
import { ListComponent } from './list/list.component';
import { NavigableListComponent } from './navigable-list/navigable-list.component';
import { panelsRoutes } from './panels-routing';
import { PanelsComponent } from './panels/panels.component';
import { RelationsComponent } from './relations/relations.component';
import { SearchComponent } from './search/search.component';
import { SelectComponent } from './select/select.component';
import { AlertComponent } from './alert/alert.component';
import { DetailComponent } from './detail/detail.component';
import { SelectEnumComponent } from './select-enum/select-enum.component';

const routes: Routes = [
    {
        path: '',
        component: HomeComponent,
        children: [
            {
                path: '',
                component: HomepageComponent,
            },
            {
                path: 'search',
                component: SearchComponent,
            },
            {
                path: 'select',
                component: SelectComponent,
            },
            {
                path: 'select-enum',
                component: SelectEnumComponent,
            },
            {
                path: 'hierarchic',
                component: HierarchicComponent,
            },
            {
                path: 'relation',
                component: RelationsComponent,
                resolve: {any: AnyResolver},
            },
            {
                path: 'panels',
                component: PanelsComponent,
                children: [
                    {
                        matcher: NaturalPanelsUrlMatcher,
                        component: NaturalPanelsComponent,
                        data: {panelsRoutes: panelsRoutes},
                    },
                ],
            },
            {
                path: 'list',
                component: ListComponent,
                data: {
                    title: 'Listing of something',
                    contextColumns: ['id', 'name'],
                },
            },
            {
                path: 'alert-service',
                component: AlertComponent,
            },
            {
                path: 'nested/:listParamName',
                children: [
                    {
                        path: 'list',
                        component: ListComponent,
                        data: {
                            title: 'Listing of something else',
                            contextColumns: ['name', 'description'],
                        },
                    },
                ],
            },
            {
                path: 'editable-list',
                component: EditableListComponent,
                data: {
                    title: 'Listing of editable items',
                },
            },
            {
                path: 'navigable-list',
                component: NavigableListComponent,
                data: {
                    title: 'Listing of navigable items',
                },
            },
            {
                path: 'detail',
                component: DetailComponent,
                data: {
                    title: 'Detail page',
                },
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, {paramsInheritanceStrategy: 'always'})],
    exports: [RouterModule],
})
export class AppRoutingModule {
}
