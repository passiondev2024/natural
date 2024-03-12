import {Component} from '@angular/core';
import {Literal} from '@ecodev/natural';
import {NaturalDetailHeaderComponent} from '../../../projects/natural/src/lib/modules/detail-header/detail-header.component';
import {MatButtonModule} from '@angular/material/button';
import {FlexModule} from '@ngbracket/ngx-layout/flex';

@Component({
    selector: 'app-detail-header',
    templateUrl: './detail-header.component.html',
    styleUrl: './detail-header.component.scss',
    standalone: true,
    imports: [FlexModule, MatButtonModule, NaturalDetailHeaderComponent],
})
export class DetailHeaderComponent {
    public model: Literal = {};
}
