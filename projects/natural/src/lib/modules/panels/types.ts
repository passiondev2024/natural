import {ComponentType} from '@angular/cdk/portal';
import {InjectionToken, Injector} from '@angular/core';
import {UrlSegment} from '@angular/router';
import {Literal} from '../../types/types';
import {Observable} from 'rxjs';
import {NaturalAbstractPanel} from './abstract-panel';
import {LinkableObject} from '../../services/link-mutation.service';

/**
 * Kind of snapshot of the instance of a panel activated route
 */
export type NaturalPanelsRouteConfig = {
    segments: UrlSegment[];
    path: string;
};

/**
 * Config required to manage url and instantiate component correctly
 */
export type NaturalPanelConfig = {
    component: ComponentType<NaturalAbstractPanel>;
    injector: Injector | null;
    resolve: NaturalPanelResolves;
    params: Literal;
    rule: NaturalPanelsRouterRule;
    route: NaturalPanelsRouteConfig;
};

/**
 * Data provided to instantiated components in context of a panel/dialog
 */
export type NaturalPanelData = {
    config: NaturalPanelConfig;
    data: Literal;

    /**
     * Related objects that should be linked to the object shown in the panel after its creation
     */
    linkableObjects: LinkableObject[];
};

/**
 * Similar to Angular functional resolver interface, but simpler for our panels' needs
 */
type NaturalPanelResolve<T> = (route: NaturalPanelConfig) => Observable<T>;
export type NaturalPanelResolves = Record<string, NaturalPanelResolve<unknown>>;
/**
 * Configuration for a route
 */
export type NaturalPanelsRouterRule = {
    path: string;
    component: ComponentType<NaturalAbstractPanel>;
    resolve?: NaturalPanelResolves;
};

export type NaturalPanelsBeforeOpenPanel = {
    itemData: NaturalPanelData;
    panelConfig: NaturalPanelConfig;
    fullPanelsConfig: NaturalPanelConfig[];
    resolvedResult: any; // todo : Generic or NaturalAbstractModelService
};

export type NaturalPanelsHooksConfig = {
    beforeOpenPanel?: (
        injector: Injector,
        naturalPanelsBeforeOpenPanel: NaturalPanelsBeforeOpenPanel,
    ) => NaturalPanelData;
};

// Array of NaturalPanelsRouterRule
export type NaturalPanelsRoutesConfig = NaturalPanelsRouterRule[];

export const PanelsHooksConfig = new InjectionToken<NaturalPanelsHooksConfig>('NaturalPanelsHooksConfig');
