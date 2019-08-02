import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { NaturalDetailHeaderComponent } from './detail-header.component';

@NgModule({
    declarations: [
        NaturalDetailHeaderComponent,
    ],
    imports: [
        CommonModule,
        RouterModule,
        FlexLayoutModule,
        MatButtonModule,
    ],
    exports: [
        NaturalDetailHeaderComponent,
    ],
})
export class NaturalDetailHeaderModule {
}
