import {Directive, Input} from '@angular/core';
import {ngf} from './ngf.directive';

@Directive({
    selector: '[ngfSelect]',
    exportAs: 'ngfSelect',
})
export class ngfSelect extends ngf {
    @Input() selectable: any = true;
}
