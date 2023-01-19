import {Component} from '@angular/core';
import {ItemService} from '../../../projects/natural/src/lib/testing/item.service';
import {ErrorService} from '../../../projects/natural/src/lib/testing/error.service';
import {AbstractSelect} from '../AbstractSelect';

@Component({
    selector: 'app-select',
    templateUrl: './select.component.html',
    styleUrls: ['./select.component.scss'],
})
export class SelectComponent extends AbstractSelect {
    public constructor(service: ItemService, public override readonly errorService: ErrorService) {
        super(service, errorService);
    }
}
