import {Component} from '@angular/core';
import {validateAllFormControls, collectErrors, NaturalEnumService} from '@ecodev/natural';
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

    constructor() {}

    public validateAllFormControls(): void {
        validateAllFormControls(this.formControl);
        console.log('form errors', collectErrors(this.formControl));
    }
}
