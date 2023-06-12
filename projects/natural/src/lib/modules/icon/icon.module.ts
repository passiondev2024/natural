import {CommonModule} from '@angular/common';
import {ModuleWithProviders, NgModule} from '@angular/core';
import {MatIconModule, MatIconRegistry} from '@angular/material/icon';
import {NATURAL_ICONS_CONFIG, NaturalIconDirective, NaturalIconsConfig} from './icon.directive';

@NgModule({
    declarations: [NaturalIconDirective],
    imports: [CommonModule, MatIconModule],
    exports: [NaturalIconDirective],
})
export class NaturalIconModule {
    public constructor(iconRegistry: MatIconRegistry) {
        // Replace the old Material Icons by the new Material Symbols
        // This means that `https://fonts.googleapis.com/icon?family=Material+Icons` must be
        // replaced by `https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:FILL@1`
        const defaultFontSetClasses = iconRegistry.getDefaultFontSetClass();
        const outlinedFontSetClasses = defaultFontSetClasses
            .filter(fontSetClass => fontSetClass !== 'material-icons')
            .concat(['material-symbols-outlined']);
        iconRegistry.setDefaultFontSetClass(...outlinedFontSetClasses);
        (iconRegistry as any).foobar = 'myocnosernoienr';
    }

    public static forRoot(config: NaturalIconsConfig): ModuleWithProviders<NaturalIconModule> {
        return {
            ngModule: NaturalIconModule,
            providers: [
                {
                    provide: NATURAL_ICONS_CONFIG,
                    useValue: config,
                },
            ],
        };
    }
}
