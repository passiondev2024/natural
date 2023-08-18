import {APP_INITIALIZER, inject, Provider} from '@angular/core';
import {MatIconRegistry} from '@angular/material/icon';
import {NATURAL_ICONS_CONFIG, NaturalIconsConfig} from './icon.directive';

/**
 * Configure Material Symbols, instead of Material Icons, and configure custom Natural icons.
 *
 * This means that `https://fonts.googleapis.com/icon?family=Material+Icons` must be
 * replaced by `https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:FILL@1`.
 */
export function provideIcons(config: NaturalIconsConfig): Provider[] {
    return [
        {
            provide: NATURAL_ICONS_CONFIG,
            useValue: config,
        },
        {
            provide: APP_INITIALIZER,
            multi: true,
            useFactory: (): (() => void) => {
                const iconRegistry = inject(MatIconRegistry);
                return () => {
                    // Replace the old Material Icons by the new Material Symbols
                    const defaultFontSetClasses = iconRegistry.getDefaultFontSetClass();
                    const outlinedFontSetClasses = defaultFontSetClasses
                        .filter(fontSetClass => fontSetClass !== 'material-icons')
                        .concat(['material-symbols-outlined']);
                    iconRegistry.setDefaultFontSetClass(...outlinedFontSetClasses);
                };
            },
        },
    ];
}
