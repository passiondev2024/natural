import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatLegacyButtonModule as MatButtonModule} from '@angular/material/legacy-button';
import {RouterModule} from '@angular/router';
import {NaturalIconModule} from '../icon/icon.module';
import {NaturalFixedButtonComponent} from './fixed-button.component';

@NgModule({
    declarations: [NaturalFixedButtonComponent],
    imports: [CommonModule, RouterModule, MatButtonModule, NaturalIconModule],
    exports: [NaturalFixedButtonComponent],
})
export class NaturalFixedButtonModule {}
