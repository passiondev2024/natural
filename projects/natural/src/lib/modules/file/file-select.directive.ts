import {Directive, Input} from '@angular/core';
import {NaturalAbstractFile} from './abstract-file';

/**
 * This directive has all options to select files, except drag'n'drop.
 */
@Directive({
    selector: ':not([naturalFileDrop])[naturalFileSelect]',
})
export class NaturalFileSelectDirective extends NaturalAbstractFile {
    /**
     * Whether the user can click on the element to select something
     *
     * Override parent to enable it by default
     */
    @Input() public override selectable = true;
}
