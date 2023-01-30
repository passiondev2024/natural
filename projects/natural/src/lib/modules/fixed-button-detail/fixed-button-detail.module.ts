import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {NaturalFixedButtonModule} from '../fixed-button/fixed-button.module';
import {NaturalFixedButtonDetailComponent} from './fixed-button-detail.component';
import {MatLegacyTooltipModule as MatTooltipModule} from '@angular/material/legacy-tooltip';

@NgModule({
    declarations: [NaturalFixedButtonDetailComponent],
    imports: [CommonModule, NaturalFixedButtonModule, MatTooltipModule],
    exports: [NaturalFixedButtonDetailComponent],
})
export class NaturalFixedButtonDetailModule {}
