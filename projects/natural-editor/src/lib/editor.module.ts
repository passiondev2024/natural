import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {NaturalEditorComponent} from './editor/editor.component';
import {MatLegacyButtonModule as MatButtonModule} from '@angular/material/legacy-button';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatIconModule} from '@angular/material/icon';
import {MatLegacyMenuModule as MatMenuModule} from '@angular/material/legacy-menu';
import {LinkDialogComponent} from './link-dialog/link-dialog.component';
import {ReactiveFormsModule} from '@angular/forms';
import {MatLegacyDialogModule as MatDialogModule} from '@angular/material/legacy-dialog';
import {MatLegacyFormFieldModule as MatFormFieldModule} from '@angular/material/legacy-form-field';
import {MatLegacyInputModule as MatInputModule} from '@angular/material/legacy-input';
import {MatLegacyTooltipModule as MatTooltipModule} from '@angular/material/legacy-tooltip';
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
