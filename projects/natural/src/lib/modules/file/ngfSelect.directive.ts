import {Directive, Input} from '@angular/core';
import {ngf} from './ngf.directive';

@Directive({
    selector: '[ngfSelect]',
})
export class ngfSelect extends ngf {
    @Input() public selectable: any = true;
}
