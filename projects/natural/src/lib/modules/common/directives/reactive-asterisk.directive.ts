import {AfterContentChecked, Directive, Optional} from '@angular/core';
import {AbstractControl} from '@angular/forms';
import {MatFormField} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatSelect} from '@angular/material/select';

/**
 * Input/Select into FormField consider Validator.required from reactive form if the [required] attribute is missing in the template
 */
@Directive({
    selector: 'mat-form-field:has(input:not([required])), mat-form-field:has(mat-select:not([required]))',
})
export class ReactiveAsteriskDirective implements AfterContentChecked {
    constructor(@Optional() private matFormField: MatFormField) {}

    ngAfterContentChecked() {
        const ctrl = this.matFormField?._control;
        if (ctrl instanceof MatInput || ctrl instanceof MatSelect) {
            ctrl.required = ctrl.ngControl?.control?.validator?.({} as AbstractControl)?.required;
        }
    }
}
