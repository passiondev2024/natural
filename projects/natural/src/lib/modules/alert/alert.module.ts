import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatDialogModule} from '@angular/material/dialog';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {NaturalConfirmComponent} from './confirm.component';

@NgModule({
    declarations: [NaturalConfirmComponent],
    imports: [CommonModule, MatDialogModule, MatSnackBarModule, MatButtonModule],
})
export class NaturalAlertModule {}
