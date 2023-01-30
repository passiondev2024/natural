import {Injectable} from '@angular/core';
import {MatLegacyDialog as MatDialog} from '@angular/material/legacy-dialog';
import {
    MatLegacySnackBar as MatSnackBar,
    MatLegacySnackBarRef as MatSnackBarRef,
    LegacySimpleSnackBar as SimpleSnackBar,
} from '@angular/material/legacy-snack-bar';
import {Observable} from 'rxjs';
import {NaturalConfirmComponent, NaturalConfirmData} from './confirm.component';

@Injectable({
    providedIn: 'root',
})
export class NaturalAlertService {
    public constructor(private readonly dialog: MatDialog, private readonly snackBar: MatSnackBar) {}

    /**
     * Show an informative message in a snack bar
     */
    public info(message: string, duration: number | null = 2500): MatSnackBarRef<SimpleSnackBar> {
        return this.snackBar.open(message, undefined, {
            duration: duration === null ? undefined : duration,
            verticalPosition: 'top',
            horizontalPosition: 'end',
        });
    }

    /**
     * Show an error in a snack bar
     */
    public error(message: string, duration: number | null = 2500, action?: string): MatSnackBarRef<SimpleSnackBar> {
        return this.snackBar.open(message, action, {
            duration: duration === null ? undefined : duration,
            panelClass: ['snackbar-error'],
            verticalPosition: 'top',
            horizontalPosition: 'end',
        });
    }

    /**
     * Show a simple confirmation dialog and returns true if user confirmed it
     */
    public confirm(
        title: string,
        message: string,
        confirmText: string,
        cancelText: string = $localize`Annuler`,
    ): Observable<boolean | undefined> {
        const dialog = this.dialog.open<NaturalConfirmComponent, NaturalConfirmData, boolean>(NaturalConfirmComponent, {
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
