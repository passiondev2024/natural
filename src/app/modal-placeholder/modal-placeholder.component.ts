import {Component} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatDialogModule} from '@angular/material/dialog';

@Component({
    selector: 'app-modal-placeholder',
    templateUrl: './modal-placeholder.component.html',
    styleUrl: './modal-placeholder.component.scss',
    standalone: true,
    imports: [MatDialogModule, MatButtonModule],
})
export class ModalPlaceholderComponent {}
