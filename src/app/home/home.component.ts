import { Component, OnInit } from '@angular/core';
import { NaturalAbstractController, NaturalSidenavContainerComponent, NaturalSidenavService } from '@ecodev/natural';
import { takeUntil } from 'rxjs/operators';
import { ThemeService } from '../shared/services/theme.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
})
export class HomeComponent extends NaturalAbstractController implements OnInit {

    public menu: NaturalSidenavContainerComponent | undefined;

    constructor(public themeService: ThemeService) {
        super();
    }

    ngOnInit() {
        this.themeService.theme.subscribe(newTheme => {
            document.body.classList.remove('default');
            document.body.classList.remove('defaultDark');
            document.body.classList.add(newTheme);
        });

        NaturalSidenavService.sideNavsChange.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
            setTimeout(() => {
                this.menu = NaturalSidenavService.sideNavs.get('adminMenu') || NaturalSidenavService.sideNavs.get('profileMenu');
            });
        });

    }

}
