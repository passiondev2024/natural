import { Component, Injector, OnInit } from '@angular/core';
import { NaturalAbstractList } from '@ecodev/natural';
import { AnyService } from '../../../projects/natural/src/lib/testing/any.service';

@Component({
    selector: 'app-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.scss'],
})
export class ListComponent extends NaturalAbstractList<any, any> implements OnInit {

    public readonly pageSizeOptions = [1, 2, 3, 4, 5];

    constructor(service: AnyService,
                injector: Injector) {

        super(service, injector);
    }

}
