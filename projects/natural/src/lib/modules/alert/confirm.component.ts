import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';

@Component({
    templateUrl: './confirm.component.html',
    styleUrls: ['./confirm.component.scss'],

})
export class NaturalConfirmComponent {

    constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    }
}
