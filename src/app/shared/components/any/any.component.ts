import {Component, OnInit} from '@angular/core';
import {NaturalAbstractPanel} from '@ecodev/natural';

@Component({
    selector: 'app-any',
    templateUrl: './any.component.html',
    styleUrls: ['./any.component.scss'],
})
export class AnyComponent extends NaturalAbstractPanel implements OnInit {
    constructor() {
        super();
    }

    public ngOnInit(): void {}
}
