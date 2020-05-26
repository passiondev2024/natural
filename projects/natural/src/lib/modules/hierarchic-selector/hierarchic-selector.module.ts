import {CdkTreeModule} from '@angular/cdk/tree';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatChipsModule} from '@angular/material/chips';
import {MatDialogModule} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatTreeModule} from '@angular/material/tree';
import {NaturalIconModule} from '../icon/icon.module';
import {NaturalSearchModule} from '../search/search.module';
import {NaturalHierarchicSelectorDialogComponent} from './hierarchic-selector-dialog/hierarchic-selector-dialog.component';
import {NaturalHierarchicSelectorComponent} from './hierarchic-selector/hierarchic-selector.component';
import {NaturalHierarchicSelectorDialogService} from './hierarchic-selector-dialog/hierarchic-selector-dialog.service';

@NgModule({
    declarations: [NaturalHierarchicSelectorComponent, NaturalHierarchicSelectorDialogComponent],
    imports: [
        CommonModule,
        FormsModule,
        CdkTreeModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatButtonModule,
        MatTreeModule,
        MatIconModule,
        MatInputModule,
        MatProgressSpinnerModule,
        MatDialogModule,
        NaturalIconModule,
        MatChipsModule,
        NaturalSearchModule,
    ],
    entryComponents: [NaturalHierarchicSelectorDialogComponent],
    providers: [NaturalHierarchicSelectorDialogService],
    exports: [NaturalHierarchicSelectorComponent],
})
export class NaturalHierarchicSelectorModule {}
