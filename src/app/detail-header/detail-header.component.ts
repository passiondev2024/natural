import {Component} from '@angular/core';
import {Literal} from '@ecodev/natural';

@Component({
    selector: 'app-detail-header',
    templateUrl: './detail-header.component.html',
    styleUrls: ['./detail-header.component.scss'],
})
export class DetailHeaderComponent {
    public model: Literal = {};
}
