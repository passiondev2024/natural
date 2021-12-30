import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormControl, FormGroup, Validators} from '@angular/forms';

export interface LinkDialogData {
    href: string;
    title?: string;
}

@Component({
    templateUrl: './link-dialog.component.html',
    styleUrls: ['./link-dialog.component.scss'],
})
export class LinkDialogComponent {
    public readonly hrefControl = new FormControl('', Validators.required);
    public readonly titleControl = new FormControl('');
    public readonly form = new FormGroup({
        href: this.hrefControl,
        title: this.titleControl,
    });

    constructor(
        @Inject(MAT_DIALOG_DATA) data: LinkDialogData,
        private dialogRef: MatDialogRef<LinkDialogComponent, LinkDialogData>,
    ) {
        this.form.setValue(data);
    }

    public maybeConfirm(): void {
        if (this.form.valid) {
            this.confirm();
        }
    }

    private confirm(): void {
        this.dialogRef.close(this.form.value);
    }
}
