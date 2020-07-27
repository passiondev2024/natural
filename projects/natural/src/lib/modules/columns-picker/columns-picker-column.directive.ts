import {AfterViewInit, Directive, ElementRef, Input, OnInit} from '@angular/core';

@Directive({
    selector: '[naturalColumnsPickerColumn]',
})
export class NaturalColumnsPickerColumnDirective implements AfterViewInit, OnInit {
    key!: string;

    /**
     * Initial checked state
     */
    @Input() checked = true;

    /**
     * Initial visibility state
     */
    @Input() hidden = false;

    /**
     * Localized label of column, if absent default to key
     */
    label!: string;

    constructor(private elementRef: ElementRef) {}

    /**
     * This must be the column key as defined in matColumnDef
     */
    @Input()
    set naturalColumnsPickerColumn(value: string) {
        this.key = value;
    }

    ngOnInit(): void {
        // Default label to key before real label is accessible
        this.label = this.key;
    }

    ngAfterViewInit(): void {
        this.label = this.elementRef.nativeElement.textContent;
    }
}
