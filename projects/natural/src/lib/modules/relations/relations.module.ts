import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatLegacyButtonModule as MatButtonModule} from '@angular/material/legacy-button';
import {MatLegacyInputModule as MatInputModule} from '@angular/material/legacy-input';
import {MatLegacyPaginatorModule as MatPaginatorModule} from '@angular/material/legacy-paginator';
import {MatLegacyProgressSpinnerModule as MatProgressSpinnerModule} from '@angular/material/legacy-progress-spinner';
import {MatLegacyTableModule as MatTableModule} from '@angular/material/legacy-table';
import {NaturalHierarchicSelectorModule} from '../hierarchic-selector/hierarchic-selector.module';
import {NaturalIconModule} from '../icon/icon.module';
import {NaturalSelectModule} from '../select/select.module';
import {NaturalRelationsComponent} from './relations.component';
import {MatLegacyTooltipModule as MatTooltipModule} from '@angular/material/legacy-tooltip';

@NgModule({
    declarations: [NaturalRelationsComponent],
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
        MatTooltipModule,
    ],
    exports: [NaturalRelationsComponent],
})
export class NaturalRelationsModule {}
