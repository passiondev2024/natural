import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { MatDialogModule } from '@angular/material';
import { RouterModule } from '@angular/router';
import { NaturalPanelsComponent } from './panels.component';
import { NaturalPanelsHooksConfig, PanelsHooksConfig } from './types';

@NgModule({
    declarations: [
        NaturalPanelsComponent,
    ],
    imports: [
        CommonModule,
        RouterModule,
        MatDialogModule,
    ],
    exports: [
        NaturalPanelsComponent,
    ],
})
export class NaturalPanelsModule {

    static forRoot(hooks?: NaturalPanelsHooksConfig): ModuleWithProviders {

        return {
            ngModule: NaturalPanelsModule,
            providers: [
                {
                    provide: PanelsHooksConfig,
                    useValue: hooks,
                },
            ],
        };
    }
}
