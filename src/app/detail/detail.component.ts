import {Component, Injector, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {collectErrors, NaturalAbstractDetail} from '@ecodev/natural';
import {AnyService} from '../../../projects/natural/src/lib/testing/any.service';

@Component({
    selector: 'app-detail',
    templateUrl: './detail.component.html',
    styleUrls: ['./detail.component.scss'],
})
export class DetailComponent extends NaturalAbstractDetail<AnyService> implements OnInit {
    public collectErrors = collectErrors;

    constructor(service: AnyService, injector: Injector, public readonly route: ActivatedRoute) {
        super('detail', service, injector);
    }
}
