import {OverlayModule} from '@angular/cdk/overlay';
import {PortalModule} from '@angular/cdk/portal';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {MatLegacyButtonModule as MatButtonModule} from '@angular/material/legacy-button';
import {MatRippleModule} from '@angular/material/core';
import {MAT_LEGACY_FORM_FIELD_DEFAULT_OPTIONS as MAT_FORM_FIELD_DEFAULT_OPTIONS} from '@angular/material/legacy-form-field';
import {MatLegacyInputModule as MatInputModule} from '@angular/material/legacy-input';
import {MatLegacyListModule as MatListModule} from '@angular/material/legacy-list';
import {MatLegacyMenuModule as MatMenuModule} from '@angular/material/legacy-menu';
import {NaturalIconModule} from '../icon/icon.module';
import {NaturalDropdownContainerComponent} from './dropdown-container/dropdown-container.component';
import {FacetSelectorComponent} from './facet-selector/facet-selector.component';
import {NaturalGroupComponent} from './group/group.component';
import {NaturalInputComponent} from './input/input.component';
import {NaturalSearchComponent} from './search/search.component';

@NgModule({
    declarations: [
        NaturalSearchComponent,
        NaturalGroupComponent,
        NaturalInputComponent,
        NaturalDropdownContainerComponent,
        FacetSelectorComponent,
    ],
    exports: [NaturalSearchComponent],
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
export class NaturalSearchModule {}
