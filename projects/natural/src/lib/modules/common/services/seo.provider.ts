import {APP_INITIALIZER, inject, Provider} from '@angular/core';
import {NATURAL_SEO_CONFIG, NaturalSeoConfig, NaturalSeoService} from './seo.service';

/**
 * Configure and starts `NaturalSeoService`
 */
export function provideSeo(config: NaturalSeoConfig): Provider[] {
    return [
        {
            provide: NATURAL_SEO_CONFIG,
            useValue: config,
        },
        {
            provide: APP_INITIALIZER,
            multi: true,
            useFactory: (): (() => void) => {
                // injection required, but works without doing anything else
                inject(NaturalSeoService);

                return () => undefined;
            },
        },
    ];
}
