import {Component, Input} from '@angular/core';
import {ThemePalette} from '@angular/material/core/common-behaviors/color';
import {RouterLink} from '@angular/router';

@Component({
    selector: 'natural-fixed-button',
    templateUrl: './fixed-button.component.html',
    styleUrls: ['./fixed-button.component.scss'],
})
export class NaturalFixedButtonComponent {
    @Input() icon!: string;
    @Input() link: RouterLink['routerLink'] = [];
    @Input() color: ThemePalette = 'accent';
    @Input() disabled = false;

    constructor() {}
}
