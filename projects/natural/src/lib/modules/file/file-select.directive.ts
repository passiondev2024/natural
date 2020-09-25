import {Directive, Input} from '@angular/core';
import {NaturalAbstractFile} from './abstract-file';

@Directive({
    selector: ':not([naturalFileDrop])[naturalFileSelect]',
})
export class NaturalFileSelectDirective extends NaturalAbstractFile {
    /**
     * Whether the user can click on the element to select something
     *
     * Override parent to enable it by default
     */
    @Input() public selectable = true;
}
