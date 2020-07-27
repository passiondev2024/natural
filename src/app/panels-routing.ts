/**
 * Resolves accept key "model" to interface existing COARD components or any other key for other components.
 * When model is provided, the other resolved data are dismissed (actually there is no case where we need it)
 */
import {NaturalPanelConfig, NaturalPanelResolve, NaturalPanelsRouterRule} from '@ecodev/natural';
import {AnyComponent} from './shared/components/any/any.component';
import {ActivatedRouteSnapshot, Resolve} from '@angular/router';
import {Observable, of} from 'rxjs';

class MyResolver implements Resolve<{model: any}>, NaturalPanelResolve<{model: any}> {
    public resolve(route: ActivatedRouteSnapshot | NaturalPanelConfig): Observable<{model: any}> {
        return of({model: {id: 123, name: 'resolved'}});
    }
}

export const panelsRoutes: NaturalPanelsRouterRule[] = [
    {
        path: 'panel/:param',
        component: AnyComponent,
        resolve: {
            foo: MyResolver,
        },
    },
];
