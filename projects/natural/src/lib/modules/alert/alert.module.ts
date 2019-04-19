import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NaturalConfirmComponent } from './confirm.component';
import { MatDialogModule, MatSnackBarModule } from '@angular/material';

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
    ],
})
export class NaturalAlertModule {
}
