import { Component } from '@angular/core';
import { NaturalAbstractEditableList, PaginatedData, QueryVariables } from '@ecodev/natural';
import { AnyService, Item } from '../../../projects/natural/src/lib/testing/any.service';

@Component({
    selector: 'app-editable-list',
    templateUrl: './editable-list.component.html',
    styleUrls: ['./editable-list.component.scss'],
})
export class EditableListComponent extends NaturalAbstractEditableList<PaginatedData<Item>, QueryVariables> {
    public columns = ['name', 'description'];

    constructor(service: AnyService) {
        super(service);

        this.service.getAll(this.variablesManager).subscribe(results => {
            this.setItems(results.items);
            this.addEmpty();
        });
    }
}
