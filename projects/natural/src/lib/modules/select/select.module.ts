import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {MatLegacyAutocompleteModule as MatAutocompleteModule} from '@angular/material/legacy-autocomplete';
import {MatLegacyButtonModule as MatButtonModule} from '@angular/material/legacy-button';
import {MatLegacyInputModule as MatInputModule} from '@angular/material/legacy-input';
import {MatLegacyProgressSpinnerModule as MatProgressSpinnerModule} from '@angular/material/legacy-progress-spinner';
import {MatLegacyTooltipModule as MatTooltipModule} from '@angular/material/legacy-tooltip';
import {RouterModule} from '@angular/router';
import {NaturalIconModule} from '../icon/icon.module';
import {NaturalSelectHierarchicComponent} from './select-hierarchic/select-hierarchic.component';
import {NaturalSelectComponent} from './select/select.component';
import {NaturalCommonModule} from '../common/common-module';
import {MatLegacySelectModule as MatSelectModule} from '@angular/material/legacy-select';
import {MatLegacyFormFieldModule as MatFormFieldModule} from '@angular/material/legacy-form-field';
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
