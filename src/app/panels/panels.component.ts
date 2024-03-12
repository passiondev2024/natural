import {Component} from '@angular/core';
import {RouterLink, RouterOutlet} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {FlexModule} from '@ngbracket/ngx-layout/flex';

@Component({
    selector: 'app-panels',
    templateUrl: './panels.component.html',
    styleUrl: './panels.component.scss',
    standalone: true,
    imports: [FlexModule, MatButtonModule, RouterLink, RouterOutlet],
})
export class PanelsComponent {}
