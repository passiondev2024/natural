import {DOCUMENT} from '@angular/common';
import {Inject, Injectable, InjectionToken, LOCALE_ID} from '@angular/core';
import {Meta, Title} from '@angular/platform-browser';
import {ActivatedRouteSnapshot, Data, NavigationEnd, PRIMARY_OUTLET, Router} from '@angular/router';
import {filter, startWith} from 'rxjs/operators';
import {NaturalDialogTriggerComponent} from '../../dialog-trigger/dialog-trigger.component';
import {combineLatest, Observable, of} from 'rxjs';

export type NaturalSeo = NaturalSeoBasic | NaturalSeoCallback | NaturalSeoResolve;

/**
 * Typically used for "static" pages where there is not a single resolved object. So
 * all pages such as "About", or list of objects (list of risks, etc.).
 *
 * This should be the most common used variant.
 */
export type NaturalSeoBasic = Robots & {
    /**
     * The page title, that will be concatenated with application name
     */
    title: string;

    /**
     * If given will be used as page description, otherwise fallback on default value
     */
    description?: string;

    /**
     * List of parameters included in the canonical tag's url
     */
    canonicalQueryParamsWhitelist?: string[];
};

type NaturalLinkDefinition = {
    charset?: string;
    crossorigin?: string;
    href?: string;
    hreflang?: string;
    media?: string;
    rel?: string;
    rev?: string;
    sizes?: string;
    target?: string;
    type?: string;
} & {
    [prop: string]: string;
};
/**
 * Typically used for a "dynamic" page where a single object is resolved. So a detail page, such
 * as the detail of a risk and so on.
 */
export type NaturalSeoResolve = Robots & {
    /**
     * The key to be used in the resolved data to find the resolved object. The fullName
     * or name of the object will be used for page title, and the object description, if any,
     * will be used for page description.
     */
    resolveKey: string;
};

/**
 * Rarely used for a page that has very specific needs and need to build title and description in a custom way.
 * The callback back will be given the resolved data, and it is up to the callback to find whatever it needs.
 */
export type NaturalSeoCallback = (routeData: Data) => NaturalSeoBasic;

/**
 * Typically used to type the routing data received in the component, eg:
 *
 * ```ts
 * class MyComponent extends NaturalAbstractDetail<MyService, NaturalSeoResolveData> {}
 * ```
 */
export type NaturalSeoResolveData = {
    seo: NaturalSeoBasic;
};

interface Robots {
    /**
     * If given will be used as robots meta tag, otherwise fallback on default value
     */
    robots?: string;
}

interface NaturalSeoConfigPlain {
    /**
     * The name of the application that will always appear in the page title
     */
    readonly applicationName: string;

    /**
     * Default value for description meta that is used for pages without value
     */
    readonly defaultDescription?: string;

    /**
     * Default value for robots meta that is used for pages without value
     */
    readonly defaultRobots?: string;

    /**
     * If given, the callback will be called for each route and must return a string that will
     * be inserted between the page title and the application name.
     *
     * It should be used to complete the title with info that are often, but not necessarily always,
     * available throughout the entire application. Typically used for the site/state in OKpilot.
     */
    readonly extraPart?: (routeData: Data) => string;

    /**
     * Used to generate alternative tags
     * <link rel="alternate" hreflang="en" href="https://www.example.com/en/page">
     */
    readonly languages?: Readonly<string[]>;
}

export type NaturalSeoConfig = NaturalSeoConfigPlain | Observable<NaturalSeoConfigPlain>;
export const NATURAL_SEO_CONFIG = new InjectionToken<NaturalSeoConfig>('Configuration for SEO service');

export function stripTags(str: string): string {
    return str.replace(/<\/?[^>]+>/g, '');
}

type ResolvedData = {
    model?: {
        name?: string;
        fullName?: string;
        description?: string;
    };
};

/**
 * This service is responsible to keep up to date the page title and page description according
 * to what is configured in routing or default values.
 *
 * It **must** be injected in the root module of the application to have effects in all modules. And it
 * must be provided a configuration.
 *
 * The full title has the following structure:
 *
 *     dialog title - page title - extra part - app name
 *
 * `dialog title` only exists if a `NaturalDialogTriggerComponent` is currently open, and that some SEO is
 * configured for it in the routing.
 */
@Injectable({
    providedIn: 'root',
})
export class NaturalSeoService {
    private routeData?: Data;
    private config: NaturalSeoConfigPlain = {
        applicationName: '',
    };

    public constructor(
        @Inject(NATURAL_SEO_CONFIG) configToken: NaturalSeoConfig,
        private readonly router: Router,
        private readonly titleService: Title,
        private readonly metaTagService: Meta,
        @Inject(DOCUMENT) private readonly document: Document,
        @Inject(LOCALE_ID) private locale: string,
    ) {
        combineLatest({
            config: configToken instanceof Observable ? configToken.pipe(startWith(this.config)) : of(configToken),
            navigationEnd: this.router.events.pipe(filter(event => event instanceof NavigationEnd)),
        }).subscribe(({config}) => {
            this.config = config;
            const root = this.router.routerState.root.snapshot;
            this.routeData = this.getRouteData(root);

            const seo: NaturalSeo = this.routeData.seo ?? {title: ''};
            const dialogRouteData = this.getDialogRouteData(root);
            const dialogSeo: NaturalSeo = dialogRouteData?.seo;

            let basic = this.toBasic(seo, this.routeData);
            if (dialogRouteData && dialogSeo) {
                const dialogBasic = this.toBasic(dialogSeo, dialogRouteData);
                basic = {
                    ...dialogBasic,
                    title: this.join([dialogBasic.title, basic.title]),
                };
            }

            this.update(basic);
        });
    }

    /**
     * Update the SEO with given info. The extra part and app name will be appended automatically.
     *
     * In most cases, this should not be used. And instead, the SEO should be configured in the routing,
     * possibly with the callback variant for some dynamism.
     *
     * But in rare cases, only the Component is able to build a proper page title, after it gathered everything it
     * needed. For those cases, the Component can inject this service and update the SEO directly.
     */
    public update(seo: NaturalSeoBasic): void {
        // Title
        const parts = [
            seo.title,
            this.config.extraPart && this.routeData ? this.config.extraPart(this.routeData) : '',
            this.config.applicationName,
        ];

        const title = this.join(parts);
        this.titleService.setTitle(title);

        // Description
        const description = seo?.description ?? this.config.defaultDescription;
        this.updateTag('description', description);

        // Robots
        const robots = seo?.robots ?? this.config.defaultRobots;
        this.updateTag('robots', robots);

        // Canonical
        // Add language in url (after domain) if some languages are provided only
        const language = this.config.languages?.length && this.locale ? this.locale.split('-')[0] : '';
        const urlParts = this.getUrlParts(seo.canonicalQueryParamsWhitelist ?? []);
        this.updateLinkTag({rel: 'canonical', href: this.getUrl(urlParts, language)});
        this.updateAlternates(urlParts);
    }

    private updateAlternates(urlParts: {url: string; params: string}): void {
        this.config.languages?.forEach(language => {
            this.updateLinkTag({rel: 'alternate', href: this.getUrl(urlParts, language), hreflang: language});
        });
    }

    private getUrlParts(whiteListedParams: string[]): {url: string; params: string} {
        let url = 'https://' + this.document.defaultView?.window.location.hostname;
        const urlTree = this.router.parseUrl(this.router.url);

        // need better like something recursive ?
        if (urlTree.root.hasChildren()) {
            const segments = urlTree.root.children['primary'].segments;
            if (segments && segments.length > 0) {
                url += '/' + segments.map(segment => segment.path).join('/');
            }
        }

        // Query Params
        let params = '';
        for (const whiteListedParam of whiteListedParams) {
            if (whiteListedParam in urlTree.queryParams) {
                const key = encodeURIComponent(whiteListedParam);
                const value = encodeURIComponent(urlTree.queryParams[whiteListedParam]);
                if (params.length) {
                    params += '&';
                }
                params += `${key}=${value}`;
            }
        }

        if (params.length) {
            params = '?' + params;
        }

        return {url, params};
    }

    /**
     * Add language between domain and uri https://example.com/fr/folder/page
     */
    private getUrl(urlParts: {url: string; params: string}, language?: string): string {
        let url = urlParts.url;

        if (language) {
            url = this.addLanguageSegment(url, language);
        }

        if (urlParts.params) {
            url += urlParts.params;
        }

        return url;
    }

    private addLanguageSegment(url: string, language: string): string {
        const urlObj = new URL(url);
        const newPath = urlObj.pathname === '/' ? `/${language}` : `/${language}${urlObj.pathname}`;
        return urlObj.origin + newPath + urlObj.search + urlObj.hash;
    }

    private join(parts: string[]): string {
        return parts.filter(s => !!s).join(' - ');
    }

    private updateTag(name: string, value?: string): void {
        if (value) {
            this.metaTagService.updateTag({
                name: name,
                value: stripTags(value),
            });
        } else {
            this.metaTagService.removeTag(`name="${name}"`);
        }
    }

    private updateLinkTag(definition: NaturalLinkDefinition): void {
        const linkElement =
            this.document.head.querySelector<HTMLLinkElement>(this.parseSelector(definition)) ??
            this.document.head.appendChild(this.document.createElement('link'));

        if (linkElement) {
            Object.keys(definition).forEach((attribute: string) => {
                linkElement.setAttribute(attribute, definition[attribute]);
            });
        }
    }

    /**
     * Returns selector to use in querySelector to get the given link
     */
    private parseSelector(definition: NaturalLinkDefinition): string {
        let attributes = 'link';
        Object.keys(definition).forEach(attr => {
            if (attr !== 'href') {
                attributes += `[${attr}="${definition[attr]}"]`;
            }
        });

        return attributes;
    }

    /**
     * Returns the data from the most deep/specific activated route
     */
    private getRouteData(route: ActivatedRouteSnapshot): Data {
        if (route.firstChild) {
            return this.getRouteData(route.firstChild);
        } else {
            return route.data;
        }
    }

    /**
     * Returns the data from the `NaturalDialogTriggerComponent` if one is open
     */
    private getDialogRouteData(route: ActivatedRouteSnapshot): Data | null {
        if (route.component === NaturalDialogTriggerComponent && route.outlet !== PRIMARY_OUTLET) {
            return route.data;
        }

        for (const child of route.children) {
            const data = this.getDialogRouteData(child);
            if (data) {
                return data;
            }
        }

        return null;
    }

    private toBasic(seo: NaturalSeo, routeData: Data): NaturalSeoBasic {
        if (typeof seo === 'function') {
            return seo(routeData);
        } else if ('resolveKey' in seo) {
            const data: ResolvedData | undefined = routeData[seo.resolveKey];
            if (!data) {
                throw new Error('Could not find resolved data for SEO service with key: ' + seo.resolveKey);
            }

            return {
                title: data.model?.fullName ?? data.model?.name ?? '',
                description: data.model?.description,
                robots: seo.robots,
            };
        }

        return seo;
    }
}
