import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef, MatDialogModule} from '@angular/material/dialog';
import {FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ifValid} from '@ecodev/natural';
import {MatButtonModule} from '@angular/material/button';
import {CommonModule} from '@angular/common';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';

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
    standalone: true,
    imports: [
        MatDialogModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        CommonModule,
        MatButtonModule,
    ],
})
export class ClassDialogComponent {
    public readonly classControl = new FormControl('', {
        validators: Validators.pattern(/(^\s*(-?[_a-zA-Z]+[_a-zA-Z0-9-]*\s*)+)/),
        nonNullable: true,
    });
    public readonly form = new FormGroup({
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
        this.dialogRef.close(this.form.getRawValue());
    }
}
