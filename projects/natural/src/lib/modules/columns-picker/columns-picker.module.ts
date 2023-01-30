import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatLegacyButtonModule as MatButtonModule} from '@angular/material/legacy-button';
import {MatLegacyCheckboxModule as MatCheckboxModule} from '@angular/material/legacy-checkbox';
import {MatLegacyMenuModule as MatMenuModule} from '@angular/material/legacy-menu';
import {NaturalIconModule} from '../icon/icon.module';
import {NaturalColumnsPickerColumnDirective} from './columns-picker-column.directive';
import {NaturalColumnsPickerComponent} from './columns-picker.component';
import {MatLegacyTooltipModule as MatTooltipModule} from '@angular/material/legacy-tooltip';

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
    ],
    exports: [NaturalColumnsPickerColumnDirective, NaturalColumnsPickerComponent],
})
export class NaturalColumnsPickerModule {}
