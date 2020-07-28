import {AfterViewInit, Directive, ElementRef, Input, OnInit} from '@angular/core';

@Directive({
    selector: '[naturalColumnsPickerColumn]',
})
export class NaturalColumnsPickerColumnDirective implements AfterViewInit, OnInit {
    public key!: string;

    /**
     * Initial checked state
     */
    @Input() public checked = true;

    /**
     * Initial visibility state
     */
    @Input() public hidden = false;

    /**
     * Localized label of column, if absent default to key
     */
    public label!: string;

    constructor(private elementRef: ElementRef) {}

    /**
     * This must be the column key as defined in matColumnDef
     */
    @Input()
    set naturalColumnsPickerColumn(value: string) {
        this.key = value;
    }

    public ngOnInit(): void {
        // Default label to key before real label is accessible
        this.label = this.key;
    }

    public ngAfterViewInit(): void {
        this.label = this.elementRef.nativeElement.textContent;
    }
}
