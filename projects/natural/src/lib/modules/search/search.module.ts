import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
    MatButtonModule,
    MatCheckboxModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatRippleModule,
    MatDatepickerModule, MAT_FORM_FIELD_DEFAULT_OPTIONS,
} from '@angular/material';
import { NaturalSearchComponent } from './search/search.component';
import { NaturalInputComponent } from './input/input.component';
import { PortalModule } from '@angular/cdk/portal';
import { OverlayModule } from '@angular/cdk/overlay';
import { NaturalDropdownContainerComponent } from './dropdown-container/dropdown-container.component';
import { TypeNumericComponent } from './dropdown-components/type-numeric/type-numeric.component';
import { ConfigurationSelectorComponent } from './dropdown-components/configuration-selector/configuration-selector.component';
import { TypeSelectComponent } from './dropdown-components/type-select/type-select.component';
import { NaturalGroupComponent } from './group/group.component';
import { TypeNumericRangeComponent } from './dropdown-components/type-numeric-range/type-numeric-range.component';
import { TypeDateRangeComponent } from './dropdown-components/type-date-range/type-date-range.component';

@NgModule({
    declarations: [
        NaturalSearchComponent,
        NaturalGroupComponent,
        NaturalInputComponent,
        NaturalDropdownContainerComponent,
        TypeNumericComponent,
        ConfigurationSelectorComponent,
        TypeSelectComponent,
        TypeNumericRangeComponent,
        TypeDateRangeComponent,
    ],
    entryComponents: [
        NaturalDropdownContainerComponent,
        ConfigurationSelectorComponent,
        TypeNumericComponent,
        TypeSelectComponent,
        TypeNumericRangeComponent,
        TypeDateRangeComponent,
    ],
    exports: [
        NaturalDropdownContainerComponent,
        NaturalSearchComponent,
        TypeNumericComponent,
        TypeSelectComponent,
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatCheckboxModule,
        MatIconModule,
        MatButtonModule,
        MatMenuModule,
        MatRippleModule,
        PortalModule,
        OverlayModule,
        MatDialogModule,
        MatListModule,
        MatDatepickerModule,
    ],
    providers: [
        {
            provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
            useValue: {
                appearance: 'fill',
            },
        },
    ],
})
export class NaturalSearchModule {
}
