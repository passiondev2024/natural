import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {RouterModule} from '@angular/router';
import {NaturalIconModule} from '../icon/icon.module';
import {NaturalFixedButtonComponent} from './fixed-button.component';
import {MatIconModule} from '@angular/material/icon';

@NgModule({
    declarations: [NaturalFixedButtonComponent],
    imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule, NaturalIconModule],
    exports: [NaturalFixedButtonComponent],
})
export class NaturalFixedButtonModule {}
