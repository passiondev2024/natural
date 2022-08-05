import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';
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
    public readonly hrefControl = new UntypedFormControl('', Validators.required);
    public readonly titleControl = new UntypedFormControl('');
    public readonly form = new UntypedFormGroup({
        href: this.hrefControl,
        title: this.titleControl,
    });

    public constructor(
        @Inject(MAT_DIALOG_DATA) data: LinkDialogData,
        private dialogRef: MatDialogRef<LinkDialogComponent, LinkDialogData>,
    ) {
        this.form.setValue(data);
    }

    public maybeConfirm(): void {
        ifValid(this.form).subscribe(() => this.confirm());
    }

    private confirm(): void {
        this.dialogRef.close(this.form.value);
    }
}
