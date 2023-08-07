import {TestBed} from '@angular/core/testing';
import {
    NATURAL_SEO_CONFIG,
    NaturalMatomoService,
    NaturalSeo,
    NaturalSeoConfig,
    NaturalSeoService,
} from '@ecodev/natural';
import {RouterTestingModule} from '@angular/router/testing';
import {Component} from '@angular/core';
import {Router, Routes} from '@angular/router';
import {DOCUMENT} from '@angular/common';
import {PaqItem} from './matomo.service';

@Component({
    template: ` <div>Test component</div>`,
})
class TestSimpleComponent {}

const routes: Routes = [
    {
        path: 'page-1',
        component: TestSimpleComponent,
        data: {
            seo: {
                title: 'Page One',
            } satisfies NaturalSeo,
        },
    },
    {
        path: 'page-2',
        component: TestSimpleComponent,
        data: {
            seo: {
                title: 'Page Two',
            } satisfies NaturalSeo,
        },
    },
];

describe('NaturalMatomoService', () => {
    let service: NaturalMatomoService;
    let router: Router;
    let theWindow: WindowProxy & typeof globalThis & {_paq?: PaqItem[]};
    let injectSpy: jasmine.Spy<NaturalMatomoService['injectTrackingCode']>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RouterTestingModule.withRoutes(routes)],
            providers: [
                {
                    provide: NATURAL_SEO_CONFIG,
                    useValue: {
                        applicationName: 'my app',
                    } satisfies NaturalSeoConfig,
                },
            ],
        }).compileComponents();

        service = TestBed.inject(NaturalMatomoService);
        injectSpy = spyOn<any>(service, 'injectTrackingCode');
        TestBed.inject(NaturalSeoService); // Result not used, but necessary to inject so we get proper page title
        router = TestBed.inject(Router);
        const window = TestBed.inject(DOCUMENT).defaultView;
        if (!window) {
            throw new Error('Could not init get `window` for testing');
        }

        theWindow = window;
    });

    afterEach(() => {
        // Clean up global state
        delete theWindow._paq;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should inject tracker code with given url', () => {
        service.startTracking('https://example.com', 1);
        expect(injectSpy).toHaveBeenCalledOnceWith('https://example.com');
    });

    it('should support replacement of _paq object by Matomo', () => {
        expect(theWindow._paq).toBeUndefined();
        service.startTracking('https://example.com', 1);

        expect(theWindow._paq).toEqual([
            ['setTrackerUrl', 'https://example.com/matomo.php'],
            ['setSiteId', 1],
        ]);

        service.push('setCustomDimension', 1, 'foo');
        expect(theWindow._paq).toEqual([
            ['setTrackerUrl', 'https://example.com/matomo.php'],
            ['setSiteId', 1],
            ['setCustomDimension', 1, 'foo'],
        ]);

        // Copy paq in a different array
        const originalPaq = theWindow._paq ?? [];
        theWindow._paq = [...originalPaq];

        service.push('setCustomDimension', 1, 'bar');
        expect(theWindow._paq).toEqual([
            ['setTrackerUrl', 'https://example.com/matomo.php'],
            ['setSiteId', 1],
            ['setCustomDimension', 1, 'foo'],
            ['setCustomDimension', 1, 'bar'],
        ]);

        expect(originalPaq).not.toBe(theWindow._paq);
    });

    it('should track page change automatically', async () => {
        service.startTracking('https://example.com', 1);

        expect(theWindow._paq).toEqual([
            ['setTrackerUrl', 'https://example.com/matomo.php'],
            ['setSiteId', 1],
        ]);

        await router.navigateByUrl('page-1');

        expect(theWindow._paq).toEqual([
            ['setTrackerUrl', 'https://example.com/matomo.php'],
            ['setSiteId', 1],
            ['setCustomUrl', theWindow.location.href],
            ['setDocumentTitle', 'Page One - my app'],
            ['trackPageView'],
        ]);

        await router.navigateByUrl('page-2');

        expect(theWindow._paq).toEqual([
            ['setTrackerUrl', 'https://example.com/matomo.php'],
            ['setSiteId', 1],
            ['setCustomUrl', theWindow.location.href],
            ['setDocumentTitle', 'Page One - my app'],
            ['trackPageView'],
            ['setCustomUrl', theWindow.location.href],
            ['setDocumentTitle', 'Page Two - my app'],
            ['setReferrerUrl', theWindow.location.href],
            ['trackPageView'],
        ]);
    });
});
