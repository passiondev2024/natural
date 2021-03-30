import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {
    NaturalAbstractPanel,
    NaturalPanelConfig,
    NaturalPanelData,
    NaturalPanelResolve,
    NaturalPanelsComponent,
    NaturalPanelsModule,
    NaturalPanelsRouterRule,
    naturalPanelsUrlMatcher,
} from '@ecodev/natural';
import {Component, Injectable, NgZone, ViewChild} from '@angular/core';
import {Router, RouterOutlet, Routes, UrlSegment} from '@angular/router';
import {Observable, of} from 'rxjs';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {MatDialog} from '@angular/material/dialog';
import {fallbackIfNoOpenedPanels} from './fallback-if-no-opened-panels.urlmatcher';

@Component({
    template: '<router-outlet></router-outlet>',
})
class TestRootComponent {
    @ViewChild(RouterOutlet) public routerOutlet!: RouterOutlet;
}

@Component({
    template: `<h1>Page without panels at all</h1>`,
})
class TestNoPanelComponent {}

@Component({
    template: `
        <h1>Page with panels</h1>
        <router-outlet></router-outlet>
    `,
})
class TestWithPanelComponent {}

@Component({
    template: `<h1>Panel A content</h1>`,
})
class TestPanelAComponent extends NaturalAbstractPanel {}

@Component({
    template: `<h1>Panel B content</h1>`,
})
class TestPanelBComponent extends NaturalAbstractPanel {}

@Component({
    template: `<h1>404 fallback page</h1>`,
})
class TestFallbackComponent {}

@Injectable({
    providedIn: 'root',
})
class MyResolver implements NaturalPanelResolve<string> {
    public resolve(route: NaturalPanelConfig): Observable<string> {
        return of('my resolved data');
    }
}

const panelsRoutes: NaturalPanelsRouterRule[] = [
    {
        path: 'panel-a/:param',
        component: TestPanelAComponent,
        resolve: {foo: MyResolver},
    },
    {
        path: 'panel-b/:param',
        component: TestPanelBComponent,
    },
];

const routesWithoutFallback: Routes = [
    {
        path: 'no-panels',
        component: TestNoPanelComponent,
    },
    {
        path: 'with-panels',
        component: TestWithPanelComponent,
        children: [
            {
                matcher: naturalPanelsUrlMatcher,
                component: NaturalPanelsComponent,
                data: {panelsRoutes: panelsRoutes},
            },
        ],
    },
];

const routesWithFallback: Routes = [
    {
        path: 'no-panels',
        component: TestNoPanelComponent,
    },
    {
        path: 'with-panels',
        component: TestWithPanelComponent,
        children: [
            {
                matcher: naturalPanelsUrlMatcher,
                component: NaturalPanelsComponent,
                data: {panelsRoutes: panelsRoutes},
            },
        ],
    },
    {
        path: 'no-panels',
        component: TestNoPanelComponent,
    },
    {
        path: 'fallback-url',
        component: TestFallbackComponent,
    },
    {
        // 404 redirects to home
        matcher: fallbackIfNoOpenedPanels,
        redirectTo: 'fallback-url',
    },
];

function injectPanelCount(panelData: NaturalPanelData, pc: string): void {
    panelData.config.params.pc = pc;
    const lastSegment = panelData.config.route.segments[panelData.config.route.segments.length - 1];
    lastSegment.parameters.pc = pc;
}

describe('Panels', () => {
    let rootFixture: ComponentFixture<TestRootComponent>;
    let rootComponent: TestRootComponent;
    let router: Router;
    let ngZone: NgZone;
    let dialog: MatDialog;
    let myResolver: MyResolver;
    let panelA2: NaturalPanelData;
    let panelA3: NaturalPanelData;
    let panelB1: NaturalPanelData;

    async function configure(routes: Routes): Promise<void> {
        await TestBed.configureTestingModule({
            imports: [NoopAnimationsModule, RouterTestingModule.withRoutes(routes), NaturalPanelsModule.forRoot()],
            declarations: [
                TestRootComponent,
                TestNoPanelComponent,
                TestWithPanelComponent,
                TestPanelAComponent,
                TestPanelBComponent,
                TestFallbackComponent,
            ],
        }).compileComponents();

        rootFixture = TestBed.createComponent(TestRootComponent);
        rootComponent = rootFixture.componentInstance;
        router = TestBed.inject(Router);
        ngZone = TestBed.inject(NgZone);
        dialog = TestBed.inject(MatDialog);
        myResolver = TestBed.inject(MyResolver);

        rootFixture.detectChanges();

        panelA2 = {
            config: {
                component: TestPanelAComponent,
                resolve: {
                    foo: myResolver,
                },
                params: {
                    param: '2',
                },
                rule: {
                    path: 'panel-a/:param',
                    component: TestPanelAComponent,
                    resolve: {
                        foo: MyResolver,
                    },
                },
                route: {
                    segments: [new UrlSegment('panel-a', {}), new UrlSegment('2', {})],
                    path: 'panel-a/2',
                },
            },
            data: {
                foo: 'my resolved data',
            },
            linkableObjects: [],
        };

        panelA3 = {
            config: {
                component: TestPanelAComponent,
                resolve: {
                    foo: myResolver,
                },
                params: {
                    param: '3',
                },
                rule: {
                    path: 'panel-a/:param',
                    component: TestPanelAComponent,
                    resolve: {
                        foo: MyResolver,
                    },
                },
                route: {
                    segments: [new UrlSegment('panel-a', {}), new UrlSegment('3', {})],
                    path: 'panel-a/3',
                },
            },
            data: {
                foo: 'my resolved data',
            },
            linkableObjects: [],
        };

        panelB1 = {
            config: {
                component: TestPanelBComponent,
                resolve: {},
                params: {
                    param: '1',
                },
                rule: {
                    path: 'panel-b/:param',
                    component: TestPanelBComponent,
                },
                route: {
                    segments: [new UrlSegment('panel-b', {}), new UrlSegment('1', {})],
                    path: 'panel-b/1',
                },
            },
            data: {},
            linkableObjects: [],
        };
    }

    function getOpenedPanelData(): NaturalPanelData[] {
        return dialog.openDialogs.map(d => d.componentInstance.panelData);
    }

    function testCommonBehavior(): void {
        it('can navigate to no-panels', fakeAsync(() => {
            expect(rootFixture).not.toBeNull();
            rootFixture.ngZone?.run(() => router.navigate(['no-panels']));
            tick(100);

            expect(rootComponent.routerOutlet.component).toBeInstanceOf(TestNoPanelComponent);
            expect(getOpenedPanelData()).withContext('nothing opened yet').toEqual([]);
        }));

        it('can navigate to with-panels, then open panel A, then open panel B, then open panel A again', fakeAsync(() => {
            expect(rootFixture).not.toBeNull();
            rootFixture.ngZone?.run(() => router.navigate(['with-panels']));
            tick(100);

            expect(rootComponent.routerOutlet.component).toBeInstanceOf(TestWithPanelComponent);
            expect(getOpenedPanelData()).withContext('nothing opened yet').toEqual([]);

            // Open panel A 2
            rootFixture.ngZone?.run(() => router.navigate(['with-panels', 'panel-a', '2']));
            tick(100);

            expect(getOpenedPanelData()).withContext('panel A 2 should have been opened').toEqual([panelA2]);

            // Open panel A 3 with an URL which is **not** prefixed
            rootFixture.ngZone?.run(() => router.navigate(['panel-a', '3']));
            tick(100);

            injectPanelCount(panelA3, '2'); // Also expect `pc` parameter
            expect(getOpenedPanelData())
                .withContext('panel A 3 should have been opened in addition of A 2')
                .toEqual([panelA2, panelA3]);
        }));

        it('can deep navigate directly into sub-panels', fakeAsync(() => {
            expect(rootFixture).not.toBeNull();
            rootFixture.ngZone?.run(() =>
                router.navigate(['with-panels', 'panel-a', '2', 'panel-a', '3', 'panel-b', '1']),
            );
            tick(100);

            expect(rootComponent.routerOutlet.component).toBeInstanceOf(TestWithPanelComponent);
            expect(getOpenedPanelData()).toEqual([panelA2, panelA3, panelB1]);
        }));
    }

    describe('without fallback', () => {
        beforeEach(async () => {
            await configure(routesWithoutFallback);
        });

        testCommonBehavior();
    });

    describe('with fallback', () => {
        beforeEach(async () => {
            await configure(routesWithFallback);
        });

        testCommonBehavior();

        it('can fallback to 404 page if given invalid url', fakeAsync(() => {
            expect(rootFixture).not.toBeNull();
            rootFixture.ngZone?.run(() => router.navigate(['my-invalid-url']));
            tick(100);

            expect(rootComponent.routerOutlet.component).toBeInstanceOf(TestFallbackComponent);
            expect(getOpenedPanelData()).toEqual([]);
        }));

        it('can fallback to 404 page if given invalid url when panel is already opened', fakeAsync(() => {
            expect(rootFixture).not.toBeNull();

            // Open panel A 2
            rootFixture.ngZone?.run(() => router.navigate(['with-panels', 'panel-a', '2']));
            tick(100);

            expect(getOpenedPanelData()).withContext('panel A 2 should have been opened').toEqual([panelA2]);

            rootFixture.ngZone?.run(() => router.navigate(['my-invalid-url', '123']));
            tick(1000);

            expect(rootComponent.routerOutlet.component).toBeInstanceOf(TestFallbackComponent);
            expect(getOpenedPanelData()).toEqual([]);
        }));

        it('can fallback to 404 page if given deep panels invalid url', fakeAsync(() => {
            expect(rootFixture).not.toBeNull();
            rootFixture.ngZone?.run(() =>
                router.navigate(['with-panels', 'panel-a', '2', 'panel-a', '3', 'my-invalid-url']),
            );
            tick(100);

            expect(rootComponent.routerOutlet.component).toBeInstanceOf(TestFallbackComponent);
            expect(getOpenedPanelData()).toEqual([]);
        }));
    });
});
