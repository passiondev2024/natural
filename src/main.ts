import {provideHttpClient} from '@angular/common/http';
import {enableProdMode} from '@angular/core';
import {DateAdapter, provideNativeDateAdapter} from '@angular/material/core';
import {MAT_PAGINATOR_DEFAULT_OPTIONS, MatPaginatorDefaultOptions} from '@angular/material/paginator';
import {MAT_TABS_CONFIG, MatTabsConfig} from '@angular/material/tabs';
import {bootstrapApplication} from '@angular/platform-browser';
import {provideAnimations} from '@angular/platform-browser/animations';
import {provideRouter, withRouterConfig} from '@angular/router';
import {
    NaturalLinkMutationService,
    naturalProviders,
    NaturalSwissParsingDateAdapter,
    provideErrorHandler,
    provideIcons,
    providePanels,
    provideSeo,
} from '@ecodev/natural';
import {Apollo} from 'apollo-angular';
import {routes} from './app/app-routing';
import {AppComponent} from './app/app.component';
import {DemoLoggerExtra} from './app/demo.error-handler';
import {AnyLinkMutationService} from './app/shared/services/any-link-mutation.service';
import {environment} from './environments/environment';

if (environment.production) {
    enableProdMode();
}

bootstrapApplication(AppComponent, {
    providers: [
        provideNativeDateAdapter(),
        Apollo,
        naturalProviders,
        provideIcons({
            natural: {
                svg: 'assets/logo.svg',
            },
            github: {
                svg: 'assets/github.svg',
            },
        }),
        provideErrorHandler(null, DemoLoggerExtra),
        providePanels({}),
        {
            provide: DateAdapter,
            useClass: NaturalSwissParsingDateAdapter,
        },
        {
            provide: NaturalLinkMutationService,
            useClass: AnyLinkMutationService,
        },
        {
            // See https://github.com/angular/components/issues/26580
            provide: MAT_PAGINATOR_DEFAULT_OPTIONS,
            useValue: {
                formFieldAppearance: 'fill',
            } satisfies MatPaginatorDefaultOptions,
        },
        {
            provide: MAT_TABS_CONFIG,
            useValue: {
                stretchTabs: false,
            } satisfies MatTabsConfig,
        },
        provideAnimations(),
        provideHttpClient(),
        provideRouter(
            routes,
            withRouterConfig({
                paramsInheritanceStrategy: 'always',
            }),
        ),
        provideSeo({
            applicationName: 'Natural',
            defaultDescription: 'An amazing angular library',
            languages: ['fr', 'en', 'de', 'it', 'pt'],
        }),
    ],
}).catch(err => console.error(err));
