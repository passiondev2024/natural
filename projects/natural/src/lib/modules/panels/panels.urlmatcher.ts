import { Injector } from '@angular/core';
import { Route, UrlSegment, UrlSegmentGroup } from '@angular/router';
import { flatten, merge } from 'lodash';
import { NaturalPanelConfig, NaturalPanelsRouterRule } from './types';

// @dynamic
export class NaturalPanelsUrlMatcherUtility {

    public static getConsumedSegments(segments: UrlSegment[], routes: NaturalPanelsRouterRule[]): UrlSegment[] {
        return flatten(NaturalPanelsUrlMatcherUtility.getStackConfig(segments, routes).map(conf => conf.route.segments));
    }

    /**
     * Return a list of items specifying the component, the service and the optional id of url segments
     */
    public static getStackConfig(segments: UrlSegment[],
                                 routes: NaturalPanelsRouterRule[],
                                 injector: Injector | null = null): NaturalPanelConfig[] {

        if (!routes) {
            return [];
        }

        const comp = NaturalPanelsUrlMatcherUtility.getComponentConfig(segments, routes, injector);

        if (comp) {
            return [comp].concat(this.getStackConfig(segments.slice(comp.route.segments.length), routes, injector));
        }

        return [];
    }

    /**
     * Returns an object with a component class, a service and an optional id from current and next url segments
     */
    public static getComponentConfig(segments: UrlSegment[],
                                     routes: NaturalPanelsRouterRule[],
                                     injector: Injector | null = null): NaturalPanelConfig | null {

        if (!segments.length) {
            return null;
        }

        // For each config
        for (const routeConfig of routes) {
            const params = {};
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
                let resolve;

                if (injector && routeConfig.resolve && Object.keys(routeConfig.resolve).length) {
                    resolve = Object.assign({}, routeConfig.resolve);
                    Object.keys(resolve).forEach(key => {
                        resolve[key] = injector.get<any>(resolve[key]);
                    });
                }

                const matrixParams = segments.reduce((groupedParams, segment) => {
                    return merge(groupedParams, segment.parameters);
                }, {});

                return {
                    component: routeConfig.component,
                    resolve: resolve,
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
            return this.getComponentConfig(segments.slice(0, -1), routes, injector);
        }

        return null;
    }
}

// TODO : CHECK https://github.com/angular/angular/issues/29824 for non return typing, and return null value
export function NaturalPanelsUrlMatcher(segments: UrlSegment[], group: UrlSegmentGroup, route: Route) {
    const matchedSegments = NaturalPanelsUrlMatcherUtility.getConsumedSegments(segments, route.data ? route.data.panelsRoutes : []);

    if (matchedSegments.length) {
        return {consumed: matchedSegments};
    }

    return null;
}
