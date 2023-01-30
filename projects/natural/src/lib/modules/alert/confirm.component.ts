import {Component, Inject} from '@angular/core';
import {MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';

export interface NaturalConfirmData {
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
}

@Component({
    templateUrl: './confirm.component.html',
    styleUrls: ['./confirm.component.scss'],
})
export class NaturalConfirmComponent {
    public constructor(@Inject(MAT_DIALOG_DATA) public data: NaturalConfirmData) {}
}
