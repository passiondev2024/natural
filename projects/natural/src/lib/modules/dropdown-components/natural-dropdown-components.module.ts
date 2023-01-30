import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatLegacyButtonModule as MatButtonModule} from '@angular/material/legacy-button';
import {MatLegacyCheckboxModule as MatCheckboxModule} from '@angular/material/legacy-checkbox';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatLegacyFormFieldModule as MatFormFieldModule} from '@angular/material/legacy-form-field';
import {MatLegacyInputModule as MatInputModule} from '@angular/material/legacy-input';
import {MatLegacyListModule as MatListModule} from '@angular/material/legacy-list';
import {MatLegacySelectModule as MatSelectModule} from '@angular/material/legacy-select';
import {NaturalHierarchicSelectorModule} from '../hierarchic-selector/hierarchic-selector.module';
import {NaturalSelectModule} from '../select/select.module';
import {TypeDateComponent} from './type-date/type-date.component';
import {TypeHierarchicSelectorComponent} from './type-hierarchic-selector/type-hierarchic-selector.component';
import {TypeNaturalSelectComponent} from './type-natural-select/type-natural-select.component';
import {TypeNumberComponent} from './type-number/type-number.component';
import {TypeSelectComponent} from './type-select/type-select.component';
import {TypeTextComponent} from './type-text/type-text.component';
import {TypeDateRangeComponent} from './type-date-range/type-date-range.component';

const components = [
    TypeNumberComponent,
    TypeSelectComponent,
    TypeDateComponent,
    TypeDateRangeComponent,
    TypeNaturalSelectComponent,
    TypeTextComponent,
    TypeHierarchicSelectorComponent,
];

@NgModule({
    declarations: [...components],
    exports: [...components],
    imports: [
        CommonModule,
        FormsModule,
        MatFormFieldModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatInputModule,
        MatListModule,
        MatCheckboxModule,
        MatDatepickerModule,
        MatSelectModule,
        NaturalSelectModule,
        NaturalHierarchicSelectorModule,
    ],
})
export class NaturalDropdownComponentsModule {}
