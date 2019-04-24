import { AbstractControlOptions, AsyncValidatorFn, FormControl, ValidatorFn } from '@angular/forms';
import { Subject } from 'rxjs';

/**
 * Does the same job as FormControl but emits a notification when dirty/touched state changes.
 * It allows to control children on demand, like when we want to validate the whole form on creation.
 */
export class NaturalFormControl extends FormControl {
    public touchedChanges: Subject<boolean> = new Subject<boolean>();
    public dirtyChanges: Subject<boolean> = new Subject<boolean>();

    constructor(formState?: any,
                validatorOrOpts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null,
                asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null,
    ) {
        super(formState, validatorOrOpts, asyncValidator);
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
