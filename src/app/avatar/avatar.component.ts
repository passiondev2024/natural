import {Component} from '@angular/core';
import {NgFor} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {NaturalAvatarComponent} from '../../../projects/natural/src/lib/modules/avatar/component/avatar.component';
import {FlexModule} from '@ngbracket/ngx-layout/flex';

@Component({
    templateUrl: './avatar.component.html',
    styleUrls: ['./avatar.component.scss'],
    standalone: true,
    imports: [FlexModule, NaturalAvatarComponent, MatButtonModule, NgFor],
})
export class AvatarComponent {
    public failedSources: number[] = [];
}
