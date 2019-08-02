import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NaturalIconModule } from '../icon/icon.module';
import { NaturalSelectComponent } from './select.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

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
        FlexLayoutModule,
        MatProgressSpinnerModule,
        NaturalIconModule,
    ],
    exports: [
        NaturalSelectComponent,
    ],
})
export class NaturalSelectModule {
}
