import {Component, Input} from '@angular/core';
import {ThemePalette} from '@angular/material/core/common-behaviors/color';

@Component({
    selector: 'natural-fixed-button',
    templateUrl: './fixed-button.component.html',
    styleUrls: ['./fixed-button.component.scss'],
})
export class NaturalFixedButtonComponent {
    @Input() link?: string;
    @Input() icon!: string;
    @Input() color: ThemePalette = 'accent';
    @Input() disabled = false;

    constructor() {}
}
