import {CommonModule} from '@angular/common';
import {ModuleWithProviders, NgModule} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {NATURAL_ICONS_CONFIG, NaturalIconDirective, NaturalIconsConfig} from './icon.directive';

@NgModule({
    declarations: [NaturalIconDirective],
    imports: [CommonModule, MatIconModule],
    exports: [NaturalIconDirective],
})
export class NaturalIconModule {
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
