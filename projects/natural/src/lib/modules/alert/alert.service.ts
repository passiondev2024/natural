import { Injectable } from '@angular/core';
import { MatDialog, MatSnackBar, MatSnackBarRef, SimpleSnackBar } from '@angular/material';
import { NaturalConfirmComponent } from './confirm.component';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class NaturalAlertService {

    constructor(private dialog: MatDialog, private snackBar: MatSnackBar) {
    }

    /**
     * Show an informative message in a snack bar
     */
    public info(message: string, duration: number = 2500): MatSnackBarRef<SimpleSnackBar> {
        return this.snackBar.open(message, undefined, {
            duration: duration,
            verticalPosition: 'top',
            horizontalPosition: 'end',
        });
    }

    /**
     * Show an error in a snack bar
     */
    public error(message: string, duration: number = 2500): MatSnackBarRef<SimpleSnackBar> {
        return this.snackBar.open(message, undefined, {
            duration: duration,
            panelClass: ['snackbar-error'],
            verticalPosition: 'top',
            horizontalPosition: 'end',
        });
    }

    /**
     * Show a simple confirmation dialog
     */
    public confirm<R = any>(
        title: string,
        message: string,
        confirmText: string,
        cancelText: string = 'Annuler',
    ): Observable<R | undefined> {

        const dialog = this.dialog.open<NaturalConfirmComponent, any, R>(NaturalConfirmComponent, {
            data: {
                title: title,
                message: message,
                confirmText: confirmText,
                cancelText: cancelText,
            },
        });

        return dialog.afterClosed();
    }
}
