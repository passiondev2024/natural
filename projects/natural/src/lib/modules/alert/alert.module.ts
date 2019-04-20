import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule, MatDialogModule, MatSnackBarModule } from '@angular/material';
import { NaturalConfirmComponent } from './confirm.component';

@NgModule({
    declarations: [
        NaturalConfirmComponent,
    ],
    entryComponents: [
        NaturalConfirmComponent,
    ],
    imports: [
        CommonModule,
        MatDialogModule,
        MatSnackBarModule,
        MatButtonModule,
    ],
})
export class NaturalAlertModule {
}
