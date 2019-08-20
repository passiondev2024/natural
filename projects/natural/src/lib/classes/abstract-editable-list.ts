import { AbstractControl, FormArray, FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { merge } from 'lodash';
import { NaturalAbstractModelService } from '../services/abstract-model.service';
import { NaturalAbstractController } from './abstract-controller';
import { NaturalAbstractDetail } from './abstract-detail';
import { NaturalQueryVariablesManager, QueryVariables } from './query-variable-manager';

/**
 * This class helps managing non-paginated rows of items that can be edited in-place, typically in a <mat-table>.
 * But it does **not** mutate anything to persist the edits on the server. It is up to the consuming component to implement
 * custom mutation mechanism.
 *
 * To access data of this component from a parent component, use:
 *
 * @ViewChildren(ComponentType) cmp: ComponentType;
 * this.cmp.getItems();
 *
 * To add empty line, call:
 * this.cmp.addEmpty();
 */
export class NaturalAbstractEditableList<Tall extends { items: any[] }, Vall extends QueryVariables> extends NaturalAbstractController {

    public readonly form: FormGroup;
    public readonly formArray: FormArray = new FormArray([]);
    public readonly variablesManager: NaturalQueryVariablesManager<Vall> = new NaturalQueryVariablesManager<Vall>();
    public dataSource: MatTableDataSource<AbstractControl>;

    constructor(protected readonly service: NaturalAbstractModelService<any, any, Tall, Vall, any, any, any, any, any>) {
        super();

        // Create a form group with a line attributes that contain an array of formGroups (one by line = one by model)
        this.form = new FormGroup({rows: this.formArray});
        this.dataSource = new MatTableDataSource(this.formArray.controls);
        this.variablesManager.set('pagination', {pagination: {pageSize: 999, pageIndex: 0}} as Vall);
    }

    /**
     * Set the list of items (overwriting what may have existed)
     */
    public setItems(items: Tall['items']): void {
        this.formArray.controls = []; // reset list
        this.addItems(items);
    }

    /**
     * Add given items to the list
     * Reproduces the model data loading the same way as it would be on a detail page (via AbstractDetail controller) but without resolving
     */
    public addItems(items: Tall['items']): void {
        items.forEach(item => {
            const completedItem = merge(this.service.getConsolidatedForClient(), item);
            const lineFormGroup = NaturalAbstractDetail.getFormGroup(completedItem, this.service);
            this.formArray.push(lineFormGroup);
        });

        this.dataSource = new MatTableDataSource(this.formArray.controls);
    }

    public removeAt(index: number): void {
        this.formArray.removeAt(index);
        this.dataSource = new MatTableDataSource(this.formArray.controls);
    }

    /**
     * Add empty item at the end of the list
     */
    public addEmpty(): void {
        this.addItems([{}]);
    }

    /**
     * Return a list of models without any treatment.
     *
     * To mutate models, it would be required to map them using :
     *  - AbstractModelService.getInput()
     *  - AbstractModelService.getContextForCreation()
     *  - AbstractModelService.getContextForUpdate()
     *  - some other required treatment.
     */
    public getItems(): Tall['items'] {
        return this.formArray.getRawValue();
    }
}
