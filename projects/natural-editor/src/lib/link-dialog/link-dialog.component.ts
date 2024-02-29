import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef, MatDialogModule} from '@angular/material/dialog';
import {FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ifValid} from '@ecodev/natural';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';

export type LinkDialogData = {
    href: string;
    title?: string;
};

@Component({
    templateUrl: './link-dialog.component.html',
    styleUrls: ['./link-dialog.component.scss'],
    standalone: true,
    imports: [MatDialogModule, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
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
