import {Component} from '@angular/core';
import {NaturalAbstractEditableList} from '@ecodev/natural';
import {ItemService} from '../../../projects/natural/src/lib/testing/item.service';
import {takeUntil} from 'rxjs/operators';

@Component({
    selector: 'app-editable-list',
    templateUrl: './editable-list.component.html',
    styleUrls: ['./editable-list.component.scss'],
})
export class EditableListComponent extends NaturalAbstractEditableList<ItemService> {
    public columns = ['name', 'description'];

    public constructor(service: ItemService) {
        super(service);

        this.service
            .getAll(this.variablesManager)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(results => {
                this.setItems(results.items);
                this.addEmpty();
            });
    }
}
