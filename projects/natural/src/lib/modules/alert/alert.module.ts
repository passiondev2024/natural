import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatLegacyButtonModule as MatButtonModule} from '@angular/material/legacy-button';
import {MatLegacyDialogModule as MatDialogModule} from '@angular/material/legacy-dialog';
import {MatLegacySnackBarModule as MatSnackBarModule} from '@angular/material/legacy-snack-bar';
import {NaturalConfirmComponent} from './confirm.component';

@NgModule({
    declarations: [NaturalConfirmComponent],
    imports: [CommonModule, MatDialogModule, MatSnackBarModule, MatButtonModule],
})
export class NaturalAlertModule {}
