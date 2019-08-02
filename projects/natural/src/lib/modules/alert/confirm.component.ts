import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

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

    constructor(@Inject(MAT_DIALOG_DATA) public data: NaturalConfirmData) {
    }
}
