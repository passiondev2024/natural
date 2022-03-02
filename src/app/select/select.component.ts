import {Component} from '@angular/core';
import {AnyService} from '../../../projects/natural/src/lib/testing/any.service';
import {ErrorService} from '../../../projects/natural/src/lib/testing/error.service';
import {AbstractSelect} from '../AbstractSelect';

@Component({
    selector: 'app-select',
    templateUrl: './select.component.html',
    styleUrls: ['./select.component.scss'],
})
export class SelectComponent extends AbstractSelect {
    public constructor(public readonly service: AnyService, public readonly errorService: ErrorService) {
        super(service, errorService);
    }
}
