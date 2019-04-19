import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NaturalFixedButtonComponent } from './fixed-button.component';
import { MatButtonModule } from '@angular/material';
import { NaturalIconModule } from '../icon/icon.module';
import { RouterModule } from '@angular/router';

@NgModule({
    declarations: [
        NaturalFixedButtonComponent,
    ],
    imports: [
        CommonModule,
        RouterModule,
        MatButtonModule,
        NaturalIconModule,
    ],
    exports: [
        NaturalFixedButtonComponent,
    ],
})
export class NaturalFixedButtonModule {
}
