import {Component, OnInit} from '@angular/core';
import {NaturalAbstractController} from '@ecodev/natural';
import {ThemeService} from '../shared/services/theme.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
})
export class HomeComponent extends NaturalAbstractController implements OnInit {
    constructor(public themeService: ThemeService) {
        super();
    }

    ngOnInit() {
        this.themeService.theme.subscribe(newTheme => {
            document.body.classList.remove('default');
            document.body.classList.remove('defaultDark');
            document.body.classList.add(newTheme);
        });
    }
}
