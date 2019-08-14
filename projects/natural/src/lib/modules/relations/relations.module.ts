import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { NaturalHierarchicSelectorModule } from '../hierarchic-selector/hierarchic-selector.module';
import { NaturalIconModule } from '../icon/icon.module';
import { NaturalSelectModule } from '../select/select.module';
import { NaturalRelationsComponent } from './relations.component';

@NgModule({
    declarations: [
        NaturalRelationsComponent,
    ],
    imports: [
        CommonModule,
        MatInputModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        NaturalIconModule,
        MatTableModule,
        NaturalSelectModule,
        NaturalHierarchicSelectorModule,
        MatPaginatorModule,
    ],
    exports: [
        NaturalRelationsComponent,
    ],
})
export class NaturalRelationsModule {
}
