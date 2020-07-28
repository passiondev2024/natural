import {Component, EventEmitter, Input, Output} from '@angular/core';
import {FormGroup} from '@angular/forms';

@Component({
    selector: 'natural-fixed-button-detail',
    templateUrl: './fixed-button-detail.component.html',
    styleUrls: ['./fixed-button-detail.component.scss'],
})
export class NaturalFixedButtonDetailComponent {
    @Input() public model!: {
        id?: string;
        permissions?: {
            delete: boolean;
        };
    };

    @Input() public form!: FormGroup;

    @Output() public create = new EventEmitter<void>();
    @Output() public delete = new EventEmitter<void>();

    public clickCreate(): void {
        if (this.form.enabled) {
            this.create.emit();
        }
    }

    public clickDelete(): void {
        if (this.form.enabled) {
            this.delete.emit();
        }
    }
}
