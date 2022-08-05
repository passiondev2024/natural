import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';
import {ifValid} from '@ecodev/natural';

export interface ClassDialogData {
    /**
     * CSS class names
     *
     * Eg:
     *
     * - `""`
     * - `"my-class my-other-class"`
     */
    class: string;
}

@Component({
    templateUrl: './class-dialog.component.html',
    styleUrls: ['./class-dialog.component.scss'],
})
export class ClassDialogComponent {
    public readonly classControl = new UntypedFormControl(
        '',
        Validators.pattern(/(^\s*(-?[_a-zA-Z]+[_a-zA-Z0-9-]*\s*)+)/),
    );
    public readonly form = new UntypedFormGroup({
        class: this.classControl,
    });

    public constructor(
        @Inject(MAT_DIALOG_DATA) data: ClassDialogData,
        private dialogRef: MatDialogRef<ClassDialogComponent, ClassDialogData>,
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
