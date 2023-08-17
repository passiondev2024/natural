import {Component} from '@angular/core';
import {NaturalAbstractEditableList} from '@ecodev/natural';
import {ItemService} from '../../../projects/natural/src/lib/testing/item.service';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {NaturalIconDirective} from '../../../projects/natural/src/lib/modules/icon/icon.directive';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {CommonModule} from '@angular/common';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatTableModule} from '@angular/material/table';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FlexModule} from '@ngbracket/ngx-layout/flex';

@Component({
    selector: 'app-editable-list',
    templateUrl: './editable-list.component.html',
    styleUrls: ['./editable-list.component.scss'],
    standalone: true,
    imports: [
        FlexModule,
        FormsModule,
        ReactiveFormsModule,
        MatTableModule,
        MatFormFieldModule,
        MatInputModule,
        CommonModule,
        MatButtonModule,
        MatIconModule,
        NaturalIconDirective,
    ],
})
export class EditableListComponent extends NaturalAbstractEditableList<ItemService> {
    public columns = ['name', 'description'];

    public constructor(service: ItemService) {
        super(service);

        this.service
            .getAll(this.variablesManager)
            .pipe(takeUntilDestroyed())
            .subscribe(results => {
                this.setItems(results.items);
                this.addEmpty();
            });
    }
}
