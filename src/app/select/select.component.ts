import {Component} from '@angular/core';
import {NaturalHierarchicConfiguration, validateAllFormControls, collectErrors} from '@ecodev/natural';
import {AnyService} from '../../../projects/natural/src/lib/testing/any.service';
import {ErrorService} from '../../../projects/natural/src/lib/testing/error.service';
import {FormControl, Validators} from '@angular/forms';

@Component({
    selector: 'app-select',
    templateUrl: './select.component.html',
    styleUrls: ['./select.component.scss'],
})
export class SelectComponent {
    public pretext;

    public hierarchicConfig: NaturalHierarchicConfiguration[] = [
        {
            service: AnyService,
            parentsRelationNames: ['parent'],
            childrenRelationNames: ['parent'],
            selectableAtKey: 'any',
        },
    ];
    public formControl = new FormControl('', Validators.required);
    public myValue: any = null;

    constructor(public service: AnyService, public errorService: ErrorService) {}

    public validateAllFormControls(): void {
        validateAllFormControls(this.formControl);
        this.formControl.updateValueAndValidity();
        console.log('form errors', collectErrors(this.formControl));
    }
}
