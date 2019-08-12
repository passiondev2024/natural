import { Injector } from '@angular/core';
import { UrlMatchResult, UrlSegment } from '@angular/router';
import { flatten, merge } from 'lodash';
import { NaturalPanelConfig, NaturalPanelsRoutesConfig } from './types';

// @dynamic
export class NaturalPanelsUrlMatcherUtility {

    /**
     * Stores globally the panels route config for them to be available in static methods that are used by UrlMatcher
     */
    public static routesConfig: NaturalPanelsRoutesConfig | null = null;

    public static getConsumedSegments(segments: UrlSegment[]): UrlSegment[] {
        return flatten(NaturalPanelsUrlMatcherUtility.getStackConfig(segments).map(conf => conf.route.segments));
    }

    /**
     * Return a list of items specifying the component, the service and the optional id of url segments
     */
    public static getStackConfig(segments: UrlSegment[], injector: Injector | null = null): NaturalPanelConfig[] {

        const comp = NaturalPanelsUrlMatcherUtility.getComponentConfig(segments, injector);

        if (comp) {
            return [comp].concat(this.getStackConfig(segments.slice(comp.route.segments.length), injector));
        }

        return [];
    }

    /**
     * Returns an object with a component class, a service and an optional id from current and next url segments
     */
    public static getComponentConfig(segments: UrlSegment[], injector: Injector | null = null): NaturalPanelConfig | null {

        if (!segments.length) {
            return null;
        }

        if (!NaturalPanelsUrlMatcherUtility.routesConfig) {
            return null;
        }

        // For each config
        for (const routeConfig of NaturalPanelsUrlMatcherUtility.routesConfig) {
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
            return this.getComponentConfig(segments.slice(0, -1), injector);
        }

        return null;
    }
}

export function NaturalPanelsUrlMatcher(segments: UrlSegment[]): UrlMatchResult {
    return {consumed: NaturalPanelsUrlMatcherUtility.getConsumedSegments(segments)};
}
