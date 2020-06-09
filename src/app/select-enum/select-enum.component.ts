import {Component} from '@angular/core';
import {validateAllFormControls, collectErrors, NaturalEnumService, IEnum} from '@ecodev/natural';
import {FormControl, Validators} from '@angular/forms';
import {AnyEnumService} from '../../../projects/natural/src/lib/testing/any-enum.service';

@Component({
    selector: 'app-select',
    templateUrl: './select-enum.component.html',
    styleUrls: ['./select-enum.component.scss'],
    providers: [
        {
            provide: NaturalEnumService,
            useClass: AnyEnumService,
        },
    ],
})
export class SelectEnumComponent {
    public formControl = new FormControl('', Validators.required);
    public myValue: any = null;

    public optionDisabled(e: IEnum): boolean {
        return e.value === 'val2';
    }

    constructor() {}

    public validateAllFormControls(): void {
        validateAllFormControls(this.formControl);
        console.log('form errors', collectErrors(this.formControl));
    }

    public toggleDisabledAllFormControls(): void {
        this.formControl.disabled ? this.formControl.enable() : this.formControl.disable();
    }

    public setValue(): void {
        const value = 'val2';
        this.myValue = value;
        this.formControl.setValue(value);
    }

    public clearValue(): void {
        this.myValue = null;
        this.formControl.setValue(null);
    }
}
