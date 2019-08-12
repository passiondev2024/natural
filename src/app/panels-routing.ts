/**
 * Resolves accept key "model" to interface existing COARD components or any other key for other components.
 * When model is provided, the other resolved data are dismissed (actually there is no case where we need it)
 */
import { NaturalPanelsRouterRule } from '@ecodev/natural';
import { AnyComponent } from './shared/components/any/any.component';

export const panelsRoutes: NaturalPanelsRouterRule[] = [
    {
        path: 'panel/:param',
        component: AnyComponent,
    },
];
