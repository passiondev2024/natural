import {ComponentType} from '@angular/cdk/portal';
import {InjectionToken, Injector, Type} from '@angular/core';
import {UrlSegment} from '@angular/router';
import {Literal} from '../../types/types';
import {Observable} from 'rxjs';
import {NaturalAbstractPanel} from './abstract-panel';
import {LinkableObject} from '../../services/link-mutation.service';

/**
 * Kind of snapshot of the instance of a panel activated route
 */
export interface NaturalPanelsRouteConfig {
    segments: UrlSegment[];
    path: string;
}

export type NaturalPanelResolveInstances = {[key: string]: NaturalPanelResolve<unknown>};

/**
 * Config required to manage url and instantiate component correctly
 */
export interface NaturalPanelConfig {
    component: ComponentType<NaturalAbstractPanel>;
    resolve: NaturalPanelResolveInstances;
    params: Literal;
    rule: NaturalPanelsRouterRule;
    route: NaturalPanelsRouteConfig;
}

/**
 * Data provided to instantiated components in context of a panel/dialog
 */
export interface NaturalPanelData {
    config: NaturalPanelConfig;
    data: Literal;

    /**
     * Related objects that should be linked to the object shown in the panel after its creation
     */
    linkableObjects: LinkableObject[];
}

/**
 * Similar to Angular Resolve interface, but simpler for our panels needs
 */
export interface NaturalPanelResolve<T> {
    resolve(route: NaturalPanelConfig): Observable<T>;
}

/**
 * Configuration for a route
 */
export interface NaturalPanelsRouterRule {
    path: string;
    component: ComponentType<any>;
    resolve?: {[key: string]: Type<NaturalPanelResolve<unknown>>};
}

export interface NaturalPanelsBeforeOpenPanel {
    itemData: NaturalPanelData;
    panelConfig: NaturalPanelConfig;
    fullPanelsConfig: NaturalPanelConfig[];
    resolvedResult: any; // todo : Generic or NaturalAbstractModelService
}

export interface NaturalPanelsHooksConfig {
    beforeOpenPanel?: (
        injector: Injector,
        naturalPanelsBeforeOpenPanel: NaturalPanelsBeforeOpenPanel,
    ) => NaturalPanelData;
}

// Array of NaturalPanelsRouterRule
export interface NaturalPanelsRoutesConfig extends Array<NaturalPanelsRouterRule> {}

export const PanelsHooksConfig = new InjectionToken<NaturalPanelsHooksConfig>('NaturalPanelsHooksConfig');
