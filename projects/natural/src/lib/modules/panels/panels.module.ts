import {CommonModule} from '@angular/common';
import {ModuleWithProviders, NgModule} from '@angular/core';
import {MatDialogModule} from '@angular/material/dialog';
import {RouterModule} from '@angular/router';
import {NaturalPanelsComponent} from './panels.component';
import {NaturalPanelsHooksConfig, PanelsHooksConfig} from './types';

const declarations = [NaturalPanelsComponent];

@NgModule({
    declarations: declarations,
    imports: [CommonModule, RouterModule, MatDialogModule],
    exports: declarations,
})
export class NaturalPanelsModule {
    public static forRoot(hooks?: NaturalPanelsHooksConfig): ModuleWithProviders<NaturalPanelsModule> {
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
