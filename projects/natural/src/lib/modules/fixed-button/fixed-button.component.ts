import {Component, Input} from '@angular/core';
import {ThemePalette} from '@angular/material/core';
import {RouterLink} from '@angular/router';

@Component({
    selector: 'natural-fixed-button',
    templateUrl: './fixed-button.component.html',
    styleUrls: ['./fixed-button.component.scss'],
})
export class NaturalFixedButtonComponent {
    @Input({required: true}) public icon!: string;
    @Input() public link: RouterLink['routerLink'] = [];
    @Input() public color: ThemePalette = 'accent';
    @Input() public disabled = false;
}
