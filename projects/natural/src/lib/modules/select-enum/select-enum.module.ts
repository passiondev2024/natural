import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { NaturalIconModule } from '../icon/icon.module';
import { NaturalSelectEnumComponent } from './select-enum.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NaturalCommonModule } from '../common/common-module';

@NgModule({
    declarations: [
        NaturalSelectEnumComponent,
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatInputModule,
        NaturalIconModule,
        MatSelectModule,
        NaturalCommonModule,
    ],
    exports: [
        NaturalSelectEnumComponent,
    ],
})
export class NaturalSelectEnumModule {
}
