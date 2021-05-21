import {Component} from '@angular/core';
import {NaturalAbstractEditableList} from '@ecodev/natural';
import {AnyService} from '../../../projects/natural/src/lib/testing/any.service';
import {takeUntil} from 'rxjs/operators';

@Component({
    selector: 'app-editable-list',
    templateUrl: './editable-list.component.html',
    styleUrls: ['./editable-list.component.scss'],
})
export class EditableListComponent extends NaturalAbstractEditableList<AnyService> {
    public columns = ['name', 'description'];

    constructor(service: AnyService) {
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
