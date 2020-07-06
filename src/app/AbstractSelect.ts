import {FormControl, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import {collectErrors, validateAllFormControls} from '@ecodev/natural';
import {Observable} from 'rxjs';
import {AnyService, Item} from '../../projects/natural/src/lib/testing/any.service';
import {ErrorService} from '../../projects/natural/src/lib/testing/error.service';

export class AbstractSelect {
    public pretext;

    public formControl = new FormControl(null, this.getRequiredAtStart());

    /**
     * Form control for new instance testing
     */
    public formControlReplace = new FormControl(null, this.getRequiredAtStart());

    /**
     * Form group for testing update on formContr11olName directives
     */
    public formGroup: FormGroup = new FormGroup({
        amazingField: new FormControl(null, this.getRequiredAtStart()),
    });

    /**
     * Form group for testing replacement on formControlName directives
     */
    public formGroupReplace: FormGroup = new FormGroup({
        amazingField: new FormControl(null, this.getRequiredAtStart()),
    });

    public myValue: Item | null = null;
    public disabled = false;
    public freeText: Item | string | null;
    public withoutModelOutput: Item | null = null;

    constructor(public service: AnyService, public errorService?: ErrorService) {}

    public toggleDisabledAllFormControls(): void {
        this.formControl.disabled ? this.formControl.enable() : this.formControl.disable();
        this.formControlReplace.disabled ? this.formControlReplace.enable() : this.formControlReplace.disable();
        this.formGroup.disabled ? this.formGroup.enable() : this.formGroup.disable();
        this.formGroupReplace.disabled ? this.formGroupReplace.enable() : this.formGroupReplace.disable();
        this.disabled = !this.disabled;
    }

    /**
     * All FormGroups and FormControls on first instantiation (page init)
     */
    public getRequiredAtStart(): ValidatorFn | null {
        return Validators.required;
    }

    /**
     * FormGroups and FormControls that receive new instance on update
     */
    public getRequiredOnChange(): ValidatorFn | null {
        return Validators.required;
    }

    public validateAllFormControls(): void {
        validateAllFormControls(this.formControl);
        validateAllFormControls(this.formControlReplace);
        validateAllFormControls(this.formGroup);
        validateAllFormControls(this.formGroupReplace);
        console.log('form errors formControl', collectErrors(this.formControl));
        console.log('form errors formControlReplace', collectErrors(this.formControlReplace));
        console.log('form errors formGroup', collectErrors(this.formGroup));
        console.log('form errors formGroupReplace', collectErrors(this.formGroupReplace));
    }

    public getNextValue(): Observable<Item> {
        return this.service.getOne('foo');
    }

    public setValue(): void {
        this.getNextValue().subscribe(value => {
            this.myValue = value;

            this.formControl.setValue(this.myValue);
            this.formGroup.setValue({amazingField: this.myValue});

            this.formControlReplace = new FormControl(this.myValue, this.getRequiredOnChange());
            this.formGroupReplace = new FormGroup({
                amazingField: new FormControl(this.myValue, this.getRequiredOnChange()),
            });
        });
    }

    public clearValue(): void {
        this.myValue = null;

        this.formControl.setValue(this.myValue);
        this.formGroup.setValue({amazingField: this.myValue});

        this.formControlReplace = new FormControl(this.myValue, this.getRequiredOnChange());
        this.formGroupReplace = new FormGroup({
            amazingField: new FormControl(this.myValue, this.getRequiredOnChange()),
        });
    }
}
