import {Component} from '@angular/core';
import {IEnum, NaturalEnumService} from '@ecodev/natural';
import {Observable, of} from 'rxjs';
import {AnyEnumService} from '../../../projects/natural/src/lib/testing/any-enum.service';
import {AnyService} from '../../../projects/natural/src/lib/testing/any.service';
import {ErrorService} from '../../../projects/natural/src/lib/testing/error.service';
import {AbstractSelect} from '../AbstractSelect';
import {FormControl} from '@angular/forms';

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
export class SelectEnumComponent extends AbstractSelect {
    public readonly formControlMultiple = new FormControl();

    public optionDisabled(e: IEnum): boolean {
        return e.value === 'val2';
    }

    public constructor(public readonly service: AnyService, public readonly errorService: ErrorService) {
        super(service, errorService);
    }

    protected getNextValue(): Observable<any> {
        return of('val' + Math.ceil(Math.random() * Math.floor(3)));
    }
}
