import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NaturalSearchModule } from '../search/search.module';
import { NaturalHierarchicSelectorComponent } from './hierarchic-selector/hierarchic-selector.component';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTreeModule } from '@angular/material/tree';
import { NaturalHierarchicSelectorDialogService } from './services/hierarchic-selector-dialog.service';
import { CdkTreeModule } from '@angular/cdk/tree';
import { FormsModule } from '@angular/forms';
import { NaturalHierarchicSelectorDialogComponent } from './hierarchic-selector-dialog/hierarchic-selector-dialog.component';
import { NaturalIconModule } from '../icon/icon.module';

@NgModule({
    declarations: [
        NaturalHierarchicSelectorComponent,
        NaturalHierarchicSelectorDialogComponent,
    ],
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
    entryComponents: [
        NaturalHierarchicSelectorDialogComponent,
    ],
    providers: [
        NaturalHierarchicSelectorDialogService,
    ],
    exports: [
        NaturalHierarchicSelectorComponent,
    ],
})
export class NaturalHierarchicSelectorModule {
}
