import { AbstractControlOptions, AsyncValidatorFn, FormControl, ValidatorFn } from '@angular/forms';
import { Subject } from 'rxjs';

/**
 * Does the same job as FormControl but emits a notification when dirty/touched state changes.
 * It allows to control children on demand, like when we want to validate the whole form on creation.
 */
export class NaturalFormControl extends FormControl {
    /**
     * Emits when the control is marked as touched
     */
    public readonly touchedChanges = new Subject<void>();

    /**
     * Emits when the control is marked as dirty
     */
    public readonly dirtyChanges = new Subject<void>();

    constructor(
        formState?: any,
        validatorOrOpts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null,
        asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null,
    ) {
        super(formState, validatorOrOpts, asyncValidator);
    }

    markAsTouched({onlySelf}: { onlySelf?: boolean } = {}): void {
        super.markAsTouched({onlySelf});
        this.touchedChanges.next();
    }

    markAsDirty({onlySelf}: { onlySelf?: boolean } = {}): void {
        super.markAsDirty({onlySelf});
        this.dirtyChanges.next();
    }
}
