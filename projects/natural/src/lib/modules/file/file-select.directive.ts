import {Directive, Input} from '@angular/core';
import {NaturalAbstractFile} from './abstract-file';

@Directive({
    selector: '[naturalFileSelect]',
})
export class NaturalFileSelectDirective extends NaturalAbstractFile {
    /**
     * Override parent to enable it by default
     */
    @Input() public selectable = true;
}
