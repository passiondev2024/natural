import {Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {FlexModule} from '@ngbracket/ngx-layout/flex';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: true,
    imports: [FlexModule, RouterOutlet],
})
export class AppComponent {
    public title = 'natural';
}
