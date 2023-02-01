import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatTooltipModule} from '@angular/material/tooltip';
import {RouterModule} from '@angular/router';
import {NaturalIconModule} from '../icon/icon.module';
import {NaturalSelectHierarchicComponent} from './select-hierarchic/select-hierarchic.component';
import {NaturalSelectComponent} from './select/select.component';
import {NaturalCommonModule} from '../common/common-module';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {NaturalSelectEnumComponent} from './select-enum/select-enum.component';

@NgModule({
    declarations: [NaturalSelectComponent, NaturalSelectEnumComponent, NaturalSelectHierarchicComponent],
    imports: [
        CommonModule,
        MatAutocompleteModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatProgressSpinnerModule,
        MatSelectModule,
        MatTooltipModule,
        NaturalCommonModule,
        NaturalIconModule,
        ReactiveFormsModule,
        RouterModule,
    ],
    exports: [NaturalSelectComponent, NaturalSelectEnumComponent, NaturalSelectHierarchicComponent],
})
export class NaturalSelectModule {}
