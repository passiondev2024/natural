import {enableProdMode, importProvidersFrom} from '@angular/core';
import {environment} from './environments/environment';
import {AppComponent} from './app/app.component';
import {Apollo} from 'apollo-angular';
import {provideHttpClient} from '@angular/common/http';
import {routes} from './app/app-routing';
import {provideAnimations} from '@angular/platform-browser/animations';
import {bootstrapApplication} from '@angular/platform-browser';
import {MAT_PAGINATOR_DEFAULT_OPTIONS, MatPaginatorDefaultOptions} from '@angular/material/paginator';
import {AnyLinkMutationService} from './app/shared/services/any-link-mutation.service';
import {DemoLoggerExtra} from './app/demo.error-handler';
import {
    NaturalLinkMutationService,
    naturalProviders,
    NaturalSwissParsingDateAdapter,
    provideErrorHandler,
    provideIcons,
    providePanels,
} from '@ecodev/natural';
import {provideRouter, withRouterConfig} from '@angular/router';
import {DateAdapter, MatNativeDateModule} from '@angular/material/core';

if (environment.production) {
    enableProdMode();
}

bootstrapApplication(AppComponent, {
    providers: [
        importProvidersFrom(MatNativeDateModule),
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
        provideAnimations(),
        provideHttpClient(),
        provideRouter(
            routes,
            withRouterConfig({
                paramsInheritanceStrategy: 'always',
            }),
        ),
    ],
}).catch(err => console.error(err));
