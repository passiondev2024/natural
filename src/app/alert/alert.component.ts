import { Component, OnInit } from '@angular/core';
import { NaturalAlertService } from '@ecodev/natural';

@Component({
    selector: 'app-panels',
    templateUrl: './alert.component.html',
})
export class AlertComponent implements OnInit {

    constructor(private readonly alertService: NaturalAlertService) {
    }

    ngOnInit() {
    }

    public confirm(): void {
        this.alertService.confirm('Confirm example', 'Are you sure ?', 'Do it !')
            .subscribe(result => console.log('confirmation result:', result));
    }

    public error(): void {
        this.alertService.error('Something bad happened');
    }

    public info(): void {
        this.alertService.info('Useful information')
    }
}
