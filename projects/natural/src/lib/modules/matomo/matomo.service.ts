import {Inject, Injectable, PLATFORM_ID} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {DOCUMENT, isPlatformBrowser} from '@angular/common';
import {Subscription} from 'rxjs';
import {Title} from '@angular/platform-browser';

/**
 * Incomplete list of Matomo functions. But it should be enough
 * for our basic needs.
 *
 * To complete this list, maybe see https://developer.matomo.org/guides/tracking-javascript-guide
 */
type MatomoFunction =
    | 'setCustomUrl'
    | 'setCustomVariable'
    | 'setDocumentTitle'
    | 'setReferrerUrl'
    | 'setSiteId'
    | 'setTrackerUrl'
    | 'trackPageView';

export type PaqItem = [MatomoFunction, ...(number | string | null)[]];

interface Paq {
    push: (item: PaqItem) => void;
}

/**
 * Service to track visitors via Matomo.
 */
@Injectable({
    providedIn: 'root',
})
export class NaturalMatomoService {
    private subscription: Subscription | null = null;
    private readonly isBrowser: boolean;
    private readonly window: WindowProxy & typeof globalThis & {_paq?: Paq};
    private referrerUrl = '';

    constructor(
        private readonly router: Router,
        @Inject(DOCUMENT) private readonly document: Document,
        // tslint:disable-next-line:ban-types
        @Inject(PLATFORM_ID) readonly platformId: Object,
        private readonly titleService: Title,
    ) {
        this.isBrowser = isPlatformBrowser(platformId);
        const window = this.document.defaultView;
        if (!window) {
            throw new Error('Could not init MatomoService `window` is undefined');
        }

        this.window = window;
    }

    /**
     * Inject Matomo script and start tracking all page navigation
     */
    public startTracking(url: string | null, site: number | null): void {
        // Abort because no tracking info or doing SSR
        if (!url || !site || !this.isBrowser) {
            return;
        }

        this.push('setTrackerUrl', url + '/matomo.php');
        this.push('setSiteId', site);

        this.injectTrackingCode(url);
        this.listenForRouteChanges();
    }

    public stopTracking(): void {
        this.subscription?.unsubscribe();
        this.subscription = null;
        delete this.window._paq;
    }

    /**
     * Push a Matomo command on the stack
     *
     * It can be called at any time, including before Matomo is even loaded.
     *
     * Also see https://developer.matomo.org/guides/tracking-javascript-guide
     */
    public push(functionName: PaqItem[0], ...args: PaqItem[1][]): void {
        if (!this.window._paq) {
            this.window._paq = [] as any[];
        }

        // Here we must always get `_paq` freshly from window, because Matomo
        // might have changed the object after we created it
        this.window._paq.push([functionName, ...args]);
    }

    private injectTrackingCode(url: string): void {
        try {
            const script = this.document.createElement('script');
            script.async = true;
            script.defer = true;
            script.src = url + '/matomo.js';
            this.document.head.appendChild(script);
        } catch (ex) {
            console.error('Error appending Matomo analytics');
            console.error(ex);
        }
    }

    private listenForRouteChanges(): void {
        this.subscription = this.router.events.subscribe(event => {
            if (!(event instanceof NavigationEnd)) {
                return;
            }

            const currentUrl = this.window.location.href;

            this.push('setCustomUrl', currentUrl);
            this.push('setDocumentTitle', this.titleService.getTitle());
            if (this.referrerUrl) {
                this.push('setReferrerUrl', this.referrerUrl);
            }

            this.push('trackPageView');

            this.referrerUrl = currentUrl;
        });
    }
}
