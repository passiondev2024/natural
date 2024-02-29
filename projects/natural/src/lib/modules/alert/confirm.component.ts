import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogModule} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';

export type NaturalConfirmData = {
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
};

@Component({
    templateUrl: './confirm.component.html',
    styleUrls: ['./confirm.component.scss'],
    standalone: true,
    imports: [MatDialogModule, MatButtonModule],
})
export class NaturalConfirmComponent {
    public constructor(@Inject(MAT_DIALOG_DATA) public data: NaturalConfirmData) {}
}
