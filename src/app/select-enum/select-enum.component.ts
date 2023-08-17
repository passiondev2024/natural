import {Component} from '@angular/core';
import {IEnum, NaturalEnumService} from '@ecodev/natural';
import {Observable, of} from 'rxjs';
import {AnyEnumService} from '../../../projects/natural/src/lib/testing/any-enum.service';
import {ItemService} from '../../../projects/natural/src/lib/testing/item.service';
import {ErrorService} from '../../../projects/natural/src/lib/testing/error.service';
import {AbstractSelect} from '../AbstractSelect';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {NaturalSelectEnumComponent} from '../../../projects/natural/src/lib/modules/select/select-enum/select-enum.component';
import {MatButtonModule} from '@angular/material/button';
import {FlexModule} from '@ngbracket/ngx-layout/flex';

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
    standalone: true,
    imports: [FlexModule, MatButtonModule, NaturalSelectEnumComponent, FormsModule, ReactiveFormsModule, CommonModule],
})
export class SelectEnumComponent extends AbstractSelect {
    public readonly formControlMultiple = new FormControl();

    public optionDisabled(e: IEnum): boolean {
        return e.value === 'val2';
    }

    public constructor(service: ItemService, errorService: ErrorService) {
        super(service, errorService);
    }

    protected override getNextValue(): Observable<any> {
        return of('val' + Math.ceil(Math.random() * Math.floor(3)));
    }
}
