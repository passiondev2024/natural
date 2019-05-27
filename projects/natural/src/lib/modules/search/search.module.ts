import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import {
    MAT_FORM_FIELD_DEFAULT_OPTIONS,
    MatButtonModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatRippleModule,
} from '@angular/material';
import { NaturalIconModule } from '../icon/icon.module';
import { ConfigurationSelectorComponent } from './configuration-selector/configuration-selector.component';
import { NaturalDropdownContainerComponent } from './dropdown-container/dropdown-container.component';
import { NaturalGroupComponent } from './group/group.component';
import { NaturalInputComponent } from './input/input.component';
import { NaturalSearchComponent } from './search/search.component';

@NgModule({
    declarations: [
        NaturalSearchComponent,
        NaturalGroupComponent,
        NaturalInputComponent,
        NaturalDropdownContainerComponent,
        ConfigurationSelectorComponent,
    ],
    entryComponents: [
        NaturalDropdownContainerComponent,
        ConfigurationSelectorComponent,
    ],
    exports: [
        NaturalSearchComponent,
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatInputModule,
        MatButtonModule,
        MatMenuModule,
        MatRippleModule,
        PortalModule,
        OverlayModule,
        MatListModule,
        NaturalIconModule,
    ],
    providers: [
        {
            provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
            useValue: {appearance: 'fill'},
        },
    ],
})
export class NaturalSearchModule {
}
