import {TestBed} from '@angular/core/testing';
import {NATURAL_SEO_CONFIG, NaturalSeo, NaturalSeoConfig, NaturalSeoService} from '@ecodev/natural';
import {stripTags} from './seo.service';
import {RouterTestingModule} from '@angular/router/testing';
import {Component, NgZone} from '@angular/core';
import {Router, Routes} from '@angular/router';
import {Meta, Title} from '@angular/platform-browser';

@Component({
    template: '<router-outlet></router-outlet>',
})
class TestRootComponent {}

@Component({
    template: ` <div>Test component</div>`,
})
class TestSimpleComponent {}

describe('stripTags', () => {
    it('should not touch plain text', () => {
        expect(stripTags('')).toBe('');
        expect(stripTags(' ')).toBe(' ');
        expect(stripTags('foo')).toBe('foo');
        expect(stripTags('one > two > three')).toBe('one > two > three');
    });

    it('should remove all HTML tag', () => {
        expect(stripTags('<strong>')).toBe('');
        expect(stripTags('<strong></strong>')).toBe('');
        expect(stripTags('foo <strong>bar</strong> baz')).toBe('foo bar baz');
        expect(stripTags('foo <unknown-tag>bar</unknown-tag> baz')).toBe('foo bar baz');
        expect(stripTags('foo <unknown-tag attr="val">bar</unknown-tag> baz')).toBe('foo bar baz');
        expect(stripTags('foo <unknown-tag \n attr="val">bar</unknown-tag> baz')).toBe('foo bar baz');
        expect(stripTags('foo \n<unknown-tag \nattr="val">bar\n</unknown-tag> \nbaz')).toBe('foo \nbar\n \nbaz');
        expect(stripTags('<STRONG>foo<STRONG> <strong>bar</strong> <em>baz</em>')).toBe('foo bar baz');
        expect(stripTags('foo <br/>bar')).toBe('foo bar');
        expect(stripTags('<strong>one</strong> > two > three')).toBe('one > two > three');
    });
});
const routes: Routes = [
    {
        path: 'no-seo',
        component: TestSimpleComponent,
    },
    {
        path: 'basic-seo',
        component: TestSimpleComponent,
        data: {
            seo: {
                title: 'basic title',
                description: 'basic description',
                robots: 'basic robots',
            } as NaturalSeo,
        },
    },
    {
        path: 'resolve-seo',
        component: TestSimpleComponent,
        data: {
            // Here we simulate the data structure after the resolve,
            // but in a real app it would be resolved by a proper Resolver
            user: {
                model: {
                    name: 'user name',
                    description: 'user description',
                },
            },
            seo: {
                resolveKey: 'user',
                robots: 'resolve robots',
            } as NaturalSeo,
        },
    },
    {
        path: 'resolve-null-seo',
        component: TestSimpleComponent,
        data: {
            // It might happen that it resolves to nothing at all
            // This is the case on https://my-ichtus.lan:4300/booking/non-existing
            user: {
                model: null,
            },
            seo: {
                resolveKey: 'user',
                robots: 'resolve null robots',
            } as NaturalSeo,
        },
    },
    {
        path: 'callback-seo',
        component: TestSimpleComponent,
        data: {
            seo: (() => {
                return {
                    title: 'callback title',
                    description: 'callback description',
                    robots: 'callback robots',
                };
            }) as NaturalSeo,
        },
    },
];

describe('NaturalSeoService', () => {
    let service: NaturalSeoService;
    let router: Router;
    let title: Title;
    let meta: Meta;
    let ngZone: NgZone;

    function assertSeo(
        url: string,
        expectedTitle: string,
        expectedDescription: string | undefined,
        expectedRobots: string | undefined,
    ): Promise<void> {
        return ngZone.run(() =>
            router.navigateByUrl(url).then(() => {
                expect(title.getTitle()).toBe(expectedTitle);
                expect(meta.getTag('name="description"')?.getAttribute('value')).toBe(expectedDescription);
                expect(meta.getTag('name="robots"')?.getAttribute('value')).toBe(expectedRobots);
            }),
        );
    }

    async function configure(config: NaturalSeoConfig): Promise<void> {
        await TestBed.configureTestingModule({
            imports: [RouterTestingModule.withRoutes(routes)],
            providers: [
                {
                    provide: NATURAL_SEO_CONFIG,
                    useValue: config,
                },
            ],
        }).compileComponents();

        service = TestBed.inject(NaturalSeoService);
        router = TestBed.inject(Router);
        title = TestBed.inject(Title);
        meta = TestBed.inject(Meta);
        ngZone = TestBed.inject(NgZone);
    }

    describe('with simplest config', () => {
        beforeEach(async () => {
            await configure({
                applicationName: 'my app',
            });
        });

        it('should be created', () => {
            expect(service).toBeTruthy();
        });

        it('should update SEO automatically from default values', async () => {
            await assertSeo('no-seo', 'my app', undefined, undefined);
        });

        it('should update SEO automatically from basic routing', async () => {
            await assertSeo('basic-seo', 'basic title - my app', 'basic description', 'basic robots');
        });

        it('should update SEO automatically from resolve routing', async () => {
            await assertSeo('resolve-seo', 'user name - my app', 'user description', 'resolve robots');
        });

        it('should update SEO automatically from resolve routing even with null resolved', async () => {
            await assertSeo('resolve-null-seo', 'my app', undefined, 'resolve null robots');
        });

        it('should update SEO automatically from callback routing', async () => {
            await assertSeo('callback-seo', 'callback title - my app', 'callback description', 'callback robots');
        });
    });

    describe('with full config', () => {
        beforeEach(async () => {
            await configure({
                applicationName: 'my app',
                defaultDescription: 'my default description',
                defaultRobots: 'my default robots',
                extraPart: () => 'my extra part',
            });
        });

        it('should be created', () => {
            expect(service).toBeTruthy();
        });

        it('should update SEO automatically from default values', async () => {
            await assertSeo('no-seo', 'my extra part - my app', 'my default description', 'my default robots');
        });

        it('should update SEO automatically from basic routing', async () => {
            await assertSeo('basic-seo', 'basic title - my extra part - my app', 'basic description', 'basic robots');
        });

        it('should update SEO automatically from resolve routing', async () => {
            await assertSeo('resolve-seo', 'user name - my extra part - my app', 'user description', 'resolve robots');
        });

        it('should update SEO automatically from resolve routing even with null resolved', async () => {
            await assertSeo(
                'resolve-null-seo',
                'my extra part - my app',
                'my default description',
                'resolve null robots',
            );
        });

        it('should update SEO automatically from callback routing', async () => {
            await assertSeo(
                'callback-seo',
                'callback title - my extra part - my app',
                'callback description',
                'callback robots',
            );
        });
    });
});
