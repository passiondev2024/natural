import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatMenuModule} from '@angular/material/menu';
import {NaturalIconModule} from '../icon/icon.module';
import {NaturalColumnsPickerColumnDirective} from './columns-picker-column.directive';
import {NaturalColumnsPickerComponent} from './columns-picker.component';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatIconModule} from '@angular/material/icon';

@NgModule({
    declarations: [NaturalColumnsPickerColumnDirective, NaturalColumnsPickerComponent],
    imports: [
        CommonModule,
        FormsModule,
        MatMenuModule,
        MatButtonModule,
        MatCheckboxModule,
        NaturalIconModule,
        MatTooltipModule,
        MatIconModule,
    ],
    exports: [NaturalColumnsPickerColumnDirective, NaturalColumnsPickerComponent],
})
export class NaturalColumnsPickerModule {}
