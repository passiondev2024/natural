import {Injectable} from '@angular/core';
import {MatLegacySnackBar as MatSnackBar} from '@angular/material/legacy-snack-bar';
import {Observable, of} from 'rxjs';
import {NaturalLoggerExtra, NaturalLoggerType} from '@ecodev/natural';

@Injectable()
export class DemoLoggerExtra implements NaturalLoggerExtra {
    public constructor(private readonly snackBar: MatSnackBar) {}

    public getExtras(): Observable<Partial<NaturalLoggerType>> {
        this.snackBar.open('An error happened', 'Yes', {
            duration: 3000,
            panelClass: ['snackbar-error'],
            verticalPosition: 'top',
            horizontalPosition: 'end',
        });

        return of({
            extraAddedKey: 'extraAddedValue',
        });
    }
}
