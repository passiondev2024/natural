import {Component} from '@angular/core';
import {NaturalHierarchicConfiguration, validateAllFormControls, collectErrors} from '@ecodev/natural';
import {AnyService} from '../../../projects/natural/src/lib/testing/any.service';
import {FormControl, Validators} from '@angular/forms';

@Component({
    templateUrl: './select-hierarchic.component.html',
    styleUrls: ['./select-hierarchic.component.scss'],
})
export class SelectHierarchicComponent {
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
    public disabled = false;

    constructor(public service: AnyService) {}

    public validateAllFormControls(): void {
        validateAllFormControls(this.formControl);
        console.log('form errors', collectErrors(this.formControl));
    }

    public toggleDisabledAllFormControls(): void {
        this.formControl.disabled ? this.formControl.enable() : this.formControl.disable();
        this.disabled = !this.disabled;
    }

    public setValue(): void {
        this.service.getOne('foo').subscribe(item => {
            this.myValue = item;
            this.formControl.setValue(item);
        });
    }

    public clearValue(): void {
        this.myValue = null;
        this.formControl.setValue(null);
    }
}
