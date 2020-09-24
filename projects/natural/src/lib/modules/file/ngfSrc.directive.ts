import {Directive, ElementRef, Input} from '@angular/core';
import {dataUrl} from './fileTools';

@Directive({selector: '[ngfSrc]'})
export class ngfSrc {
    @Input('ngfSrc') file: any;

    constructor(public ElementRef: ElementRef) {}

    ngOnChanges(_changes: any) {
        dataUrl(this.file).then(src => (this.ElementRef.nativeElement.src = src));
    }
}
