import {OverlayModule} from '@angular/cdk/overlay';
import {PortalModule} from '@angular/cdk/portal';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatRippleModule} from '@angular/material/core';
import {MAT_FORM_FIELD_DEFAULT_OPTIONS} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatListModule} from '@angular/material/list';
import {MatMenuModule} from '@angular/material/menu';
import {NaturalIconModule} from '../icon/icon.module';
import {NaturalDropdownContainerComponent} from './dropdown-container/dropdown-container.component';
import {FacetSelectorComponent} from './facet-selector/facet-selector.component';
import {NaturalGroupComponent} from './group/group.component';
import {NaturalInputComponent} from './input/input.component';
import {NaturalSearchComponent} from './search/search.component';
import {MatIconModule} from '@angular/material/icon';

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
        MatIconModule,
    ],
    providers: [
        {
            provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
            useValue: {appearance: 'fill'},
        },
    ],
})
export class NaturalSearchModule {}
