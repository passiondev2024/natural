import {Injectable} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Literal} from '@ecodev/natural';
import {LoggerExtra} from '../../projects/natural/src/lib/modules/logger/error-handler';

@Injectable()
export class DemoLoggerExtra implements LoggerExtra {
    constructor(private readonly snackBar: MatSnackBar) {}

    public getExtras(error: unknown): Literal {
        this.snackBar.open('You failed', 'Yes', {
            duration: 3000,
            panelClass: ['snackbar-error'],
            verticalPosition: 'top',
            horizontalPosition: 'end',
        });

        return {
            very: 'much',
        };
    }
}
