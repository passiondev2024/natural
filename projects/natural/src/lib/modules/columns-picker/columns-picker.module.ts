import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
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
        MatButtonModule,
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
