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

@NgModule({
    declarations: [NaturalSelectComponent, NaturalSelectHierarchicComponent],
    imports: [
        CommonModule,
        RouterModule,
        ReactiveFormsModule,
        MatAutocompleteModule,
        MatInputModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        NaturalIconModule,
        MatTooltipModule,
    ],
    exports: [NaturalSelectComponent, NaturalSelectHierarchicComponent],
})
export class NaturalSelectModule {}
