import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatLegacyButtonModule as MatButtonModule} from '@angular/material/legacy-button';
import {RouterModule} from '@angular/router';
import {NaturalIconModule} from '../icon/icon.module';
import {NaturalTableButtonComponent} from './table-button.component';

@NgModule({
    declarations: [NaturalTableButtonComponent],
    imports: [CommonModule, RouterModule, MatButtonModule, NaturalIconModule],
    exports: [NaturalTableButtonComponent],
})
export class NaturalTableButtonModule {}
