import {Component, Input} from '@angular/core';

@Component({
    selector: 'natural-stamp',
    templateUrl: './stamp.component.html',
})
export class NaturalStampComponent {
    @Input() item;
}
