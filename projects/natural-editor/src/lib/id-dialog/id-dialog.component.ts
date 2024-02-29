import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef, MatDialogModule} from '@angular/material/dialog';
import {FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ifValid} from '@ecodev/natural';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';

export type IdDialogData = {
    /**
     * ID name
     *
     * Eg:
     *
     * - `""`
     * - `"my-id"`
     */
    id: string;
};

@Component({
    templateUrl: './id-dialog.component.html',
    styleUrls: ['./id-dialog.component.scss'],
    standalone: true,
    imports: [MatDialogModule, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
})
export class IdDialogComponent {
    public readonly idControl = new FormControl('', {
        validators: Validators.pattern(/(^(-?[_a-zA-Z]+[_a-zA-Z0-9-]*)+)/),
        nonNullable: true,
    });
    public readonly form = new FormGroup({
        id: this.idControl,
    });

    public constructor(
        @Inject(MAT_DIALOG_DATA) data: IdDialogData,
        private dialogRef: MatDialogRef<IdDialogComponent, IdDialogData>,
    ) {
        this.form.setValue(data);
    }

    public maybeConfirm(): void {
        ifValid(this.form).subscribe(() => this.confirm());
    }

    private confirm(): void {
        this.dialogRef.close(this.form.getRawValue());
    }
}
