import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {RouterModule} from '@angular/router';
import {NaturalDetailHeaderComponent} from './detail-header.component';

@NgModule({
    declarations: [NaturalDetailHeaderComponent],
    imports: [CommonModule, RouterModule, MatButtonModule],
    exports: [NaturalDetailHeaderComponent],
})
export class NaturalDetailHeaderModule {}
