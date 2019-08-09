import { ComponentType } from '@angular/cdk/portal';
import { InjectionToken, Injector } from '@angular/core';
import { UrlSegment } from '@angular/router';
import { Observable } from 'rxjs';
import { Literal } from '../../types/types';

/**
 * Kind of snapshot of the instance of a panel activated route
 */
export interface NaturalPanelsRouteConfig {
    segments: UrlSegment[];
    path: string;
}

/**
 * Config required to manage url and instantiate component correctly
 */
export interface NaturalPanelConfig {
    component: ComponentType<any>;
    resolve: { [key: string]: any; resolve: () => Observable<any> };
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

    [key: string]: any;

    // linkContext: LinkableObject[];
}

/**
 * Configuration for a route
 */
export interface NaturalPanelsRouterRule {
    path: string;
    component: ComponentType<any>;
    resolve?: Literal;
}

export interface NaturalPanelsBeforeOpenPanel {
    itemData: NaturalPanelData;
    panelConfig: NaturalPanelConfig;
    fullPanelsConfig: NaturalPanelConfig[];
    resolvedResult: any; // todo : Generic or NaturalAbstractModelService
}

export interface NaturalPanelsHooksConfig {
    beforeOpenPanel?: (injector: Injector, naturalPanelsBeforeOpenPanel: NaturalPanelsBeforeOpenPanel) => NaturalPanelData;
}

// Array of NaturalPanelsRouterRule
export interface NaturalPanelsRoutesConfig extends Array<NaturalPanelsRouterRule> {
}

export const PanelsRoutesConfig = new InjectionToken<NaturalPanelsRoutesConfig>('NaturalPanelsRoutesConfig');
export const PanelsHooksConfig = new InjectionToken<NaturalPanelsHooksConfig>('NaturalPanelsHooksConfig');
