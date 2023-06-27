import {Component} from '@angular/core';
import {NaturalAlertService} from '@ecodev/natural';
import {MatButtonModule} from '@angular/material/button';
import {FlexModule} from '@ngbracket/ngx-layout/flex';

@Component({
    selector: 'app-panels',
    templateUrl: './alert.component.html',
    standalone: true,
    imports: [FlexModule, MatButtonModule],
})
export class AlertComponent {
    public constructor(private readonly alertService: NaturalAlertService) {}

    public confirm(): void {
        this.alertService
            .confirm('Confirm example', 'Are you sure ?', 'Do it !')
            .subscribe(result => console.log('confirmation result:', result));
    }

    public error(): void {
        this.alertService.error('Something bad happened');
    }

    public info(): void {
        this.alertService.info('Useful information');
    }
}
