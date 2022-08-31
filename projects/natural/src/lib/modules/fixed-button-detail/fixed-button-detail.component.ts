import {Component, EventEmitter, Input, Output} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';

type Model = {
    id?: string;
    permissions?: {
        delete: boolean;
    };
};

@Component({
    selector: 'natural-fixed-button-detail',
    templateUrl: './fixed-button-detail.component.html',
    styleUrls: ['./fixed-button-detail.component.scss'],
})
export class NaturalFixedButtonDetailComponent {
    private canChange = true;
    public isCreation = false;

    public get model(): Model {
        return this._model;
    }

    @Input()
    public set model(value: Model) {
        this._model = value;
        if (this.canChange) {
            this.isCreation = !this._model.id;
        }
    }

    private _model!: Model;

    @Input() public form!: FormGroup;

    @Output() public readonly create = new EventEmitter<void>();
    @Output() public readonly delete = new EventEmitter<void>();

    public constructor(route: ActivatedRoute) {
        route.params.subscribe(() => (this.canChange = true));
    }

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
