import {Component, OnInit, ViewChild} from '@angular/core';
import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {NaturalCommonModule} from '@ecodev/natural';
import {Router, RouterOutlet} from '@angular/router';
import {Location} from '@angular/common';
import {RouterTestingModule} from '@angular/router/testing';
import {MatTabGroupHarness} from '@angular/material/tabs/testing';
import {MatTabsModule} from '@angular/material/tabs';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {HarnessLoader} from '@angular/cdk/testing';

@Component({
    template: '<router-outlet></router-outlet>',
})
class TestRootComponent {
    @ViewChild(RouterOutlet) public routerOutlet!: RouterOutlet;
}

@Component({
    template: `
        <mat-tab-group mat-stretch-tabs="false" naturalLinkableTab>
            <mat-tab label="Tab 1">Tab content 1</mat-tab>
            <mat-tab label="Tab 2" id="second">Tab content 2</mat-tab>
            <mat-tab label="Tab 3" id="third">Tab content 3</mat-tab>
        </mat-tab-group>
    `,
})
class TestSimpleComponent implements OnInit {
    public initialized = 0;

    public ngOnInit(): void {
        this.initialized++;
    }
}

describe('NaturalLinkableTabDirective', () => {
    let rootFixture: ComponentFixture<TestRootComponent>;
    let rootComponent: TestRootComponent;
    let router: Router;
    let location: Location;
    let loader: HarnessLoader;
    let tabGroup: MatTabGroupHarness;

    async function selectTab(label: string): Promise<void> {
        await tabGroup.selectTab({label: label});

        // Give a chance to our directive to react, before we assert the result
        await new Promise(resolve => setTimeout(resolve, 50));
    }

    async function assertTab(label: string, url: string): Promise<void> {
        expect(await tabGroup.getSelectedTab().then(tab => tab.getLabel())).toBe(label);
        expect(location.path()).toBe(url);

        // Assert component was initialized only once (and not re-initialized on every tab change)
        const component = rootComponent.routerOutlet.component as TestSimpleComponent;
        expect(component.initialized).toBe(1);
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                MatTabsModule,
                NoopAnimationsModule,
                NaturalCommonModule,
                RouterTestingModule.withRoutes([
                    {
                        path: 'test-route',
                        pathMatch: 'full',
                        component: TestSimpleComponent,
                    },
                ]),
            ],
            declarations: [TestRootComponent, TestSimpleComponent],
            providers: [],
        }).compileComponents();

        rootFixture = TestBed.createComponent(TestRootComponent);
        rootComponent = rootFixture.componentInstance;
        router = TestBed.inject(Router);

        location = TestBed.inject(Location);
        loader = TestbedHarnessEnvironment.loader(rootFixture);
    });

    beforeEach(fakeAsync(() => {
        rootFixture.ngZone?.run(() => router.navigate(['test-route']));
        rootFixture.detectChanges();
        tick(100);
    }));

    it('when tab is selected, url is updated', async () => {
        tabGroup = await loader.getHarness(MatTabGroupHarness);

        await assertTab('Tab 1', '/test-route');

        await selectTab('Tab 2');
        await assertTab('Tab 2', '/test-route#second');

        // Coming back to original tab should have clean URL
        await selectTab('Tab 1');
        await assertTab('Tab 1', '/test-route');

        await selectTab('Tab 3');
        await assertTab('Tab 3', '/test-route#third');
    });

    it('when url is updated, tab is selected', async () => {
        tabGroup = await loader.getHarness(MatTabGroupHarness);

        rootFixture.ngZone?.run(() => router.navigate(['test-route'], {fragment: 'second'}));
        await assertTab('Tab 2', '/test-route#second');

        // Coming back to original tab should have clean URL
        rootFixture.ngZone?.run(() => router.navigate(['test-route']));
        await assertTab('Tab 1', '/test-route');

        rootFixture.ngZone?.run(() => router.navigate(['test-route'], {fragment: 'third'}));
        await assertTab('Tab 3', '/test-route#third');

        // Unknown tab is ignored, current state is preserved
        rootFixture.ngZone?.run(() => router.navigate(['test-route'], {fragment: 'unknown-tab'}));
        await assertTab('Tab 3', '/test-route#unknown-tab');
    });
});
