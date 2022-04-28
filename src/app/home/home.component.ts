import {Component, Inject, OnInit} from '@angular/core';
import {NaturalAbstractController} from '@ecodev/natural';
import {ThemeService} from '../shared/services/theme.service';
import {DOCUMENT} from '@angular/common';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
})
export class HomeComponent extends NaturalAbstractController implements OnInit {
    public constructor(
        public readonly themeService: ThemeService,
        @Inject(DOCUMENT) private readonly document: Document,
    ) {
        super();
    }

    public ngOnInit(): void {
        this.themeService.theme.subscribe(newTheme => {
            this.document.body.classList.remove('default');
            this.document.body.classList.remove('defaultDark');
            this.document.body.classList.add(newTheme);
        });
    }
}
