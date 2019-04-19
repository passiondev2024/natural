import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCheckboxModule, MatMenuModule } from '@angular/material';
import { NaturalColumnsPickerColumnDirective } from './columns-picker-column.directive';
import { NaturalColumnsPickerComponent } from './columns-picker.component';
import { NaturalIconModule } from '../icon/icon.module';
import { FormsModule } from '@angular/forms';

@NgModule({
    declarations: [
        NaturalColumnsPickerColumnDirective,
        NaturalColumnsPickerComponent,
    ],
    imports: [
        CommonModule,
        FormsModule,
        MatMenuModule,
        MatCheckboxModule,
        NaturalIconModule,
    ],
    exports: [
        NaturalColumnsPickerColumnDirective,
        NaturalColumnsPickerComponent,
    ],
})
export class NaturalColumnsPickerModule {
}
