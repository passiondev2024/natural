import {AfterContentChecked, Directive, Optional} from '@angular/core';
import {AbstractControl} from '@angular/forms';
import {MatFormField} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatSelect} from '@angular/material/select';

/**
 * Input/Select into FormField consider Validator.required from reactive form if the [required] attribute is missing in the template
 */
@Directive({
    // eslint-disable-next-line @angular-eslint/directive-selector
    selector: 'mat-form-field:has(input:not([required])), mat-form-field:has(mat-select:not([required]))',
})
export class ReactiveAsteriskDirective implements AfterContentChecked {
    public constructor(@Optional() private matFormField: MatFormField | null) {}

    public ngAfterContentChecked(): void {
        const ctrl = this.matFormField?._control;
        if (ctrl instanceof MatInput || ctrl instanceof MatSelect) {
            // Here we cast to be able to set `required`. It should not be required and might be a bug in TypeScript ?
            // Try to remove and see if it compiles
            (ctrl as MatInput).required = ctrl.ngControl?.control?.validator?.({} as AbstractControl)?.required;
        }
    }
}
