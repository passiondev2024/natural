import { AsyncValidatorFn, FormControl, ValidatorFn } from '@angular/forms';
import { Subject } from 'rxjs';
import { Literal } from '@ecodev/natural';

/**
 * Does the same job as FormControl but emits a notification when dirty/touched state changes.
 * It allows to control children on demand, like when we want to validate the whole form on creation.
 */
export class NaturalFormControl extends FormControl {
    public touchedChanges: Subject<boolean> = new Subject<boolean>();
    public dirtyChanges: Subject<boolean> = new Subject<boolean>();

    constructor(formState: Literal,
                validator: ValidatorFn | ValidatorFn[] | null = null,
                asyncValidator: AsyncValidatorFn | AsyncValidatorFn[] | null = null) {

        super(formState, validator, asyncValidator);
    }

    markAsTouched({onlySelf}: { onlySelf?: boolean } = {}): void {
        super.markAsTouched({onlySelf});
        this.touchedChanges.next(true);
    }

    markAsDirty({onlySelf}: { onlySelf?: boolean } = {}): void {
        super.markAsDirty({onlySelf});
        this.dirtyChanges.next(true);
    }

}
