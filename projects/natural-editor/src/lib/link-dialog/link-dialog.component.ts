import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {ifValid} from '@ecodev/natural';

export interface LinkDialogData {
    href: string;
    title?: string;
}

@Component({
    templateUrl: './link-dialog.component.html',
    styleUrls: ['./link-dialog.component.scss'],
})
export class LinkDialogComponent {
    public readonly hrefControl = new FormControl('', {validators: Validators.required, nonNullable: true});
    public readonly titleControl = new FormControl('', {nonNullable: true});
    public readonly form = new FormGroup({
        href: this.hrefControl,
        title: this.titleControl,
    });

    public constructor(
        @Inject(MAT_DIALOG_DATA) data: LinkDialogData,
        private dialogRef: MatDialogRef<LinkDialogComponent, LinkDialogData>,
    ) {
        this.form.setValue({title: '', ...data});
    }

    public maybeConfirm(): void {
        ifValid(this.form).subscribe(() => this.confirm());
    }

    private confirm(): void {
        this.dialogRef.close(this.form.getRawValue());
    }
}
