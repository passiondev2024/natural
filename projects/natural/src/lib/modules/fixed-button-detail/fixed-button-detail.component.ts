import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
    selector: 'natural-fixed-button-detail',
    templateUrl: './fixed-button-detail.component.html',
    styleUrls: ['./fixed-button-detail.component.scss'],
})
export class NaturalFixedButtonDetailComponent implements OnInit {

    @Input() model;
    @Input() form;

    @Output() create = new EventEmitter();
    @Output() delete = new EventEmitter();

    constructor() {
    }

    ngOnInit() {
    }

}
