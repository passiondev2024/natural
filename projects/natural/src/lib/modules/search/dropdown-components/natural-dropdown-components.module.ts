import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
    MatButtonModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatListModule,
} from '@angular/material';
import { NaturalHierarchicSelectorModule } from '../../hierarchic-selector/hierarchic-selector.module';
import { NaturalSelectModule } from '../../select/select.module';
import { TypeDateRangeComponent } from './type-date-range/type-date-range.component';
import { TypeHierarchicSelectorComponent } from './type-hierarchic-selector/type-hierarchic-selector.component';
import { TypeNaturalSelectComponent } from './type-natural-search/type-natural-select.component';
import { TypeNumericRangeComponent } from './type-numeric-range/type-numeric-range.component';
import { TypeNumericComponent } from './type-numeric/type-numeric.component';
import { TypeSelectComponent } from './type-select/type-select.component';
import { TypeTextComponent } from './type-text/type-text.component';

const components = [
    TypeNumericComponent,
    TypeSelectComponent,
    TypeNumericRangeComponent,
    TypeDateRangeComponent,
    TypeNaturalSelectComponent,
    TypeTextComponent,
    TypeHierarchicSelectorComponent,
];

@NgModule({
    declarations: [...components],
    entryComponents: [...components],
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
        NaturalSelectModule,
        NaturalHierarchicSelectorModule,
    ],
})
export class NaturalDropdownComponentsModule {
}
