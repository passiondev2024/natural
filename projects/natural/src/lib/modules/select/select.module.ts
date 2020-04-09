import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { NaturalIconModule } from '../icon/icon.module';
import { NaturalSelectComponent } from './select.component';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
    declarations: [
        NaturalSelectComponent,
    ],
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
    exports: [
        NaturalSelectComponent,
    ],
})
export class NaturalSelectModule {
}
