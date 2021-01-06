import {Component} from '@angular/core';
import {AnyService} from '../../../projects/natural/src/lib/testing/any.service';
import {ErrorService} from '../../../projects/natural/src/lib/testing/error.service';
import {AbstractSelect} from '../AbstractSelect';
import {NaturalAbstractModelService, PaginatedData, QueryVariables} from '@ecodev/natural';

@Component({
    selector: 'app-select',
    templateUrl: './select.component.html',
    styleUrls: ['./select.component.scss'],
})
export class SelectComponent extends AbstractSelect {
    constructor(public service: AnyService, public errorService: ErrorService) {
        super(service, errorService);
    }
}
