import {Component, EventEmitter, Input, Output} from '@angular/core';
import {UntypedFormGroup} from '@angular/forms';

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

    @Input() public form!: UntypedFormGroup;

    @Output() public readonly create = new EventEmitter<void>();
    @Output() public readonly delete = new EventEmitter<void>();

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
