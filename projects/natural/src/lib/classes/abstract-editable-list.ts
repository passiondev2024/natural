import { OnInit } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { merge } from 'lodash';
import { MatTableDataSource } from '@angular/material/table';
import { NaturalAbstractDetail } from './abstract-detail';
import { NaturalQueryVariablesManager, QueryVariables } from './query-variable-manager';
import { NaturalAbstractController } from './abstract-controller';
import { NaturalAbstractModelService } from '../services/abstract-model.service';
import { Literal } from '../types/types';

/**
 * This class is for **EDITABLE ONLY** not **UPDATABLE*. Allows to edit some data, but don't mutates anything.
 *
 * To access data of this component from an parent one, use :
 *
 * @ViewChildren(ComponentType) cmp: ComponentType;
 * this.cmp.getList();
 *
 * To add empty line, call :
 * this.cmp.addEmpty();
 *
 */
export class NaturalAbstractEditableList<Tall extends { items: any[] }, Vall extends QueryVariables> extends NaturalAbstractController
    implements OnInit {

    public result;
    public form: FormGroup;
    public variablesManager: NaturalQueryVariablesManager<Vall> = new NaturalQueryVariablesManager<Vall>();
    public dataSource;

    constructor(protected key: string,
                protected service: NaturalAbstractModelService<any, any, Tall, Vall, any, any, any, any, any>,
    ) {
        super();
    }

    ngOnInit() {
        this.variablesManager.set('pagination', {pagination: {pageSize: 9999, pageIndex: 0}} as Vall);

        // Create a form group with a line attributes that contain an array of formGroups (one by line = one by model)
        this.form = new FormGroup({lines: new FormArray([])});
    }

    /**
     * Add given items to the list
     * Reproduces the model data loading the same way as it would be on a detail page (via AbstractDetail controller) but without resolving
     */
    public add(items: Tall) {

        const lines = this.form.get('lines') as FormArray;
        if (lines) {
            items.items.forEach(item => {
                const data = merge(this.service.getConsolidatedForClient(), item);
                const lineFormGroup = NaturalAbstractDetail.getFormGroup(data, this.service);
                lines.push(lineFormGroup);
            });
            this.dataSource = new MatTableDataSource(lines.controls);
        }
    }

    public removeAt(index: number) {
        const lines = this.form.get('lines') as FormArray;
        if (lines) {
            lines.removeAt(index);
            this.dataSource = new MatTableDataSource(lines.controls);
        }
    }

    /**
     * Add empty line in the end of list
     */
    public addEmpty() {
        const lines = this.form.get('lines') as FormArray;
        if (lines) {
            lines.push(NaturalAbstractDetail.getFormGroup({}, this.service));
            this.dataSource = new MatTableDataSource(lines.controls);
        }
    }

    public setLines(newLines: Literal[]) {
        const lines = this.form.get('lines') as FormArray;
        if (lines && newLines && newLines.length) {
            lines.controls = []; // reset list
            this.addLines(newLines);
        }
    }

    public addLines(newLines: Literal[]) {
        const lines = this.form.get('lines') as FormArray;
        if (lines && newLines && newLines.length) {
            newLines.forEach(line => {
                lines.push(NaturalAbstractDetail.getFormGroup(line, this.service));
            });

            this.dataSource = new MatTableDataSource(lines.controls);
        }
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
    public getList(): Literal[] {
        const lines = this.form.get('lines') as FormArray;
        if (lines) {
            return lines.getRawValue();
        }

        return [];
    }

    public validateForm() {
        NaturalAbstractDetail.validateAllFormFields(this.form);
    }

}
