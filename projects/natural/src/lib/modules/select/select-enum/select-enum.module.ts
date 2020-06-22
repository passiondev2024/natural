import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {NaturalCommonModule} from '../../common/common-module';
import {NaturalIconModule} from '../../icon/icon.module';
import {NaturalSelectEnumComponent} from './select-enum.component';

@NgModule({
    declarations: [NaturalSelectEnumComponent],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatInputModule,
        NaturalIconModule,
        MatSelectModule,
        NaturalCommonModule,
    ],
    exports: [NaturalSelectEnumComponent],
})
export class NaturalSelectEnumModule {}
