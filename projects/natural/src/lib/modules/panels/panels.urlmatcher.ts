import {Injector} from '@angular/core';
import {Resolve, Route, UrlMatchResult, UrlSegment, UrlSegmentGroup} from '@angular/router';
import {flatten, merge} from 'lodash-es';
import {NaturalPanelConfig, NaturalPanelResolve, NaturalPanelResolveInstances, NaturalPanelsRouterRule} from './types';
import {Literal} from '../../types/types';

function getConsumedSegments(segments: UrlSegment[], routes: NaturalPanelsRouterRule[]): UrlSegment[] {
    return flatten(getStackConfig(segments, routes).map(conf => conf.route.segments));
}

/**
 * Return a list of items specifying the component, the service and the optional id of url segments
 */
export function getStackConfig(
    segments: UrlSegment[],
    routes: NaturalPanelsRouterRule[],
    injector: Injector | null = null,
): NaturalPanelConfig[] {
    if (!routes) {
        return [];
    }

    const comp = getComponentConfig(segments, routes, injector);

    if (comp) {
        return [comp].concat(getStackConfig(segments.slice(comp.route.segments.length), routes, injector));
    }

    return [];
}

/**
 * Returns an object with a component class, a service and an optional id from current and next url segments
 */
function getComponentConfig(
    segments: UrlSegment[],
    routes: NaturalPanelsRouterRule[],
    injector: Injector | null = null,
): NaturalPanelConfig | null {
    if (!segments.length) {
        return null;
    }

    // For each config
    for (const routeConfig of routes) {
        const params: Literal = {};
        const configSegments = routeConfig.path.split('/');
        let match = true;

        // For each current url segment
        for (let i = 0; i < segments.length; i++) {
            if (!configSegments[i]) {
                match = false;
                break;
            }

            // If find variable, store it
            if (configSegments[i].indexOf(':') > -1 && +segments[i].path > 0) {
                params[configSegments[i].replace(':', '')] = segments[i].path;
            } else if (configSegments[i] !== segments[i].path) {
                // If segments are different, url does not match
                match = false;
                break;
            }
        }

        if (match) {
            const resolveInstances: NaturalPanelResolveInstances = {};
            const resolveTypes = routeConfig.resolve;

            if (injector && resolveTypes) {
                Object.keys(resolveTypes).forEach(key => {
                    resolveInstances[key] = injector.get<NaturalPanelResolve<unknown>>(resolveTypes[key]);
                });
            }

            const matrixParams = segments.reduce((groupedParams, segment) => {
                return merge(groupedParams, segment.parameters);
            }, {});

            return {
                component: routeConfig.component,
                resolve: resolveInstances,
                params: merge(params, matrixParams),
                rule: routeConfig,
                route: {
                    segments: segments,
                    path: segments.map(s => s.path).join('/'),
                },
            };
        }
    }

    if (segments.length > 1) {
        return getComponentConfig(segments.slice(0, -1), routes, injector);
    }

    return null;
}

export function NaturalPanelsUrlMatcher(segments: UrlSegment[], group: UrlSegmentGroup, route: Route): UrlMatchResult {
    const matchedSegments = getConsumedSegments(segments, route.data ? route.data.panelsRoutes : []);

    if (matchedSegments.length) {
        return {consumed: matchedSegments};
    }

    // TODO remove any cast when we use https://github.com/angular/angular/commit/568e9df1d6ea4c22f915830d424a208c7146169d in Angular 10
    return null as any;
}
