import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {NaturalEditorComponent} from './editor/editor.component';
import {MatButtonModule} from '@angular/material/button';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatIconModule} from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
import {LinkDialogComponent} from './link-dialog/link-dialog.component';
import {ReactiveFormsModule} from '@angular/forms';
import {MatDialogModule} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatTooltipModule} from '@angular/material/tooltip';
import {NaturalFileModule, NaturalIconModule} from '@ecodev/natural';
import {MatDividerModule} from '@angular/material/divider';
import {ColorDialogComponent} from './color-dialog/color-dialog.component';
import {ClassDialogComponent} from './class-dialog/class-dialog.component';
import {IdDialogComponent} from './id-dialog/id-dialog.component';
import {NaturalCustomCssDirective} from './custom-css/custom-css.directive';

const imports = [
    CommonModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatDialogModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatToolbarModule,
    MatTooltipModule,
    NaturalFileModule,
    NaturalIconModule,
    ReactiveFormsModule,
];

const declarationsToExport = [NaturalEditorComponent, NaturalCustomCssDirective];

@NgModule({
    declarations: [
        ClassDialogComponent,
        ColorDialogComponent,
        IdDialogComponent,
        LinkDialogComponent,
        ...declarationsToExport,
    ],
    imports: [...imports],
    exports: [...imports, ...declarationsToExport],
})
export class NaturalEditorModule {}
