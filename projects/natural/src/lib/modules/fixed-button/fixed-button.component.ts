import { Component, Input } from '@angular/core';

@Component({
    selector: 'natural-fixed-button',
    templateUrl: './fixed-button.component.html',
    styleUrls: ['./fixed-button.component.scss'],
})
export class NaturalFixedButtonComponent {

    @Input() link: string;
    @Input() icon: string;
    @Input() color = 'accent';
    @Input() disabled = false;

    constructor() {
    }

}
