import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule, MatInputModule, MatPaginatorModule, MatProgressSpinnerModule, MatTableModule } from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NaturalIconModule } from '../icon/icon.module';
import { NaturalSelectModule } from '../select/select.module';
import { NaturalHierarchicSelectorModule } from '../hierarchic-selector/hierarchic-selector.module';
import { NaturalRelationsComponent } from './relations.component';

@NgModule({
    declarations: [
        NaturalRelationsComponent,
    ],
    imports: [
        CommonModule,
        MatInputModule,
        MatButtonModule,
        FlexLayoutModule,
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
