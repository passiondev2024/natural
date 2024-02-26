import {Component} from '@angular/core';
import {ItemService} from '../../../projects/natural/src/lib/testing/item.service';
import {ErrorService} from '../../../projects/natural/src/lib/testing/error.service';
import {AbstractSelect} from '../AbstractSelect';
import {CommonModule} from '@angular/common';
import {NaturalIconDirective} from '../../../projects/natural/src/lib/modules/icon/icon.directive';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NaturalSelectComponent} from '../../../projects/natural/src/lib/modules/select/select/select.component';
import {MatButtonModule} from '@angular/material/button';
import {FlexModule} from '@ngbracket/ngx-layout/flex';

@Component({
    selector: 'app-select',
    templateUrl: './select.component.html',
    styleUrls: ['./select.component.scss'],
    standalone: true,
    imports: [
        FlexModule,
        MatButtonModule,
        NaturalSelectComponent,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        NaturalIconDirective,
        CommonModule,
    ],
})
export class SelectComponent extends AbstractSelect {
    public constructor(
        service: ItemService,
        public override readonly errorService: ErrorService,
    ) {
        super(service, errorService);
    }
}
