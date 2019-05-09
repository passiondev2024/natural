import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NaturalAbstractList, NaturalAlertService, NaturalPersistenceService } from '@ecodev/natural';
import { AnyService } from '../../../projects/natural/src/lib/testing/any.service';

@Component({
    selector: 'app-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.scss'],
})
export class ListComponent extends NaturalAbstractList<any, any> implements OnInit {

    public readonly pageSizeOptions = [1, 2, 3, 4, 5];

    constructor(route: ActivatedRoute,
                router: Router,
                service: AnyService,
                alertService: NaturalAlertService,
                persistenceService: NaturalPersistenceService) {

        super(service, router, route, alertService, persistenceService);
    }

}
