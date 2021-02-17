import {Component} from '@angular/core';

@Component({
    templateUrl: './avatar.component.html',
    styleUrls: ['./avatar.component.scss'],
})
export class AvatarComponent {
    public failedSources: number[] = [];
}
