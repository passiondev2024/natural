import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {NaturalEditorComponent} from './editor.component';
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
import {NaturalFileModule} from '@ecodev/natural';
import {MatDividerModule} from '@angular/material/divider';

const imports = [
    CommonModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatToolbarModule,
    MatTooltipModule,
    ReactiveFormsModule,
    NaturalFileModule,
    MatDividerModule,
];

@NgModule({
    declarations: [NaturalEditorComponent, LinkDialogComponent],
    imports: [...imports],
    exports: [...imports, NaturalEditorComponent],
})
export class NaturalEditorModule {}
