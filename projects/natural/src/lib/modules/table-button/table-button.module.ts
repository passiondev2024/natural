import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { NaturalIconModule } from '../icon/icon.module';
import { NaturalTableButtonComponent } from './table-button.component';

@NgModule({
    declarations: [
        NaturalTableButtonComponent,
    ],
    imports: [
        CommonModule,
        RouterModule,
        MatButtonModule,
        NaturalIconModule,
    ],
    exports: [
        NaturalTableButtonComponent,
    ],
})
export class NaturalTableButtonModule {
}
