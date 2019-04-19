import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material';
import { IconsConfigService, NaturalIconComponent, NaturalIconsConfig } from './icon.component';

@NgModule({
    declarations: [
        NaturalIconComponent,
    ],
    imports: [
        CommonModule,
        MatIconModule,
    ],
    exports: [
        NaturalIconComponent,
    ],
})
export class NaturalIconModule {

    static forRoot(config: NaturalIconsConfig): ModuleWithProviders {
        return {
            ngModule: NaturalIconModule,
            providers: [
                {
                    provide: IconsConfigService,
                    useValue: config,
                },
            ],
        };
    }

}
