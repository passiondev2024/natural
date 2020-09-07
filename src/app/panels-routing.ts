/**
 * Resolves accept key "model" to interface existing COARD components or any other key for other components.
 * When model is provided, the other resolved data are dismissed (actually there is no case where we need it)
 */
import {NaturalPanelConfig, NaturalPanelResolve, NaturalPanelsRouterRule} from '@ecodev/natural';
import {AnyComponent} from './shared/components/any/any.component';
import {ActivatedRouteSnapshot, Resolve} from '@angular/router';
import {Observable, of} from 'rxjs';
import {Injectable} from '@angular/core';
import {Item} from '../../projects/natural/src/lib/testing/any.service';

@Injectable({
    providedIn: 'root',
})
class MyResolver implements Resolve<Item>, NaturalPanelResolve<Item> {
    public resolve(route: ActivatedRouteSnapshot | NaturalPanelConfig): Observable<Item> {
        return of({id: '123', name: 'resolved', description: 'resolved description', children: [], parent: null});
    }
}

export const panelsRoutes: NaturalPanelsRouterRule[] = [
    {
        path: 'panel/:param',
        component: AnyComponent,
        resolve: {foo: MyResolver},
    },
];
