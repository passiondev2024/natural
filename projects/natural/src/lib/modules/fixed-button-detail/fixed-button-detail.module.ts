import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {NaturalFixedButtonModule} from '../fixed-button/fixed-button.module';
import {NaturalFixedButtonDetailComponent} from './fixed-button-detail.component';
import {MatTooltipModule} from '@angular/material/tooltip';

@NgModule({
    declarations: [NaturalFixedButtonDetailComponent],
    imports: [CommonModule, NaturalFixedButtonModule, MatTooltipModule],
    exports: [NaturalFixedButtonDetailComponent],
})
export class NaturalFixedButtonDetailModule {}
