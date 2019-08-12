import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatDialogModule } from '@angular/material';
import { RouterModule } from '@angular/router';
import { NaturalPanelsUrlMatcherUtility } from './panels.urlmatcher';
import { NaturalPanelsComponent } from './panels.component';
import { NaturalPanelsHooksConfig, NaturalPanelsRoutesConfig, PanelsHooksConfig, PanelsRoutesConfig } from './types';

@NgModule({
    declarations: [
        NaturalPanelsComponent,
    ],
    imports: [
        CommonModule,
        RouterModule,
        MatDialogModule,
        FlexLayoutModule,
    ],
    exports: [
        NaturalPanelsComponent,
    ],
})
export class NaturalPanelsModule {

    static forRoot(routes: NaturalPanelsRoutesConfig, hooks?: NaturalPanelsHooksConfig): ModuleWithProviders {

        NaturalPanelsUrlMatcherUtility.routesConfig = routes;

        return {
            ngModule: NaturalPanelsModule,
            providers: [
                {
                    provide: PanelsRoutesConfig,
                    useValue: routes,
                },
                {
                    provide: PanelsHooksConfig,
                    useValue: hooks,
                },
            ],
        };
    }
}
