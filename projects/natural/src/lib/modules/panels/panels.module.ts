import {Provider} from '@angular/core';
import {NaturalPanelsHooksConfig, PanelsHooksConfig} from './types';

export function providePanels(hooks: NaturalPanelsHooksConfig): Provider[] {
    return [
        {
            provide: PanelsHooksConfig,
            useValue: hooks,
        },
    ];
}
