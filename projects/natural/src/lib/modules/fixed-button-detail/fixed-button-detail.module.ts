import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NaturalFixedButtonModule } from '../fixed-button/fixed-button.module';
import { NaturalFixedButtonDetailComponent } from './fixed-button-detail.component';

@NgModule({
    declarations: [
        NaturalFixedButtonDetailComponent,
    ],
    imports: [
        CommonModule,
        NaturalFixedButtonModule,
    ],
    exports: [
        NaturalFixedButtonDetailComponent,
    ],
})
export class NaturalFixedButtonDetailModule {
}
