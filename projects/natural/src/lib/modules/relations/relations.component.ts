import {
    Component,
    ContentChild,
    EventEmitter,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Optional,
    Output,
    Self,
    SimpleChanges,
    TemplateRef,
    ViewChild,
} from '@angular/core';
import { NaturalLinkMutationService } from '../../services/link-mutation.service';
import { forkJoin, Observable } from 'rxjs';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { FetchResult } from 'apollo-link';
import { NaturalSelectComponent } from '../select/select.component';
import { PageEvent } from '@angular/material';
import { NaturalAbstractController } from '../../classes/abstract-controller';
import { NaturalDataSource } from '../../classes/data-source';
import { NaturalHierarchicSelectorDialogService } from '../hierarchic-selector/services/hierarchic-selector-dialog.service';
import { NaturalQueryVariablesManager, PaginationInput, QueryVariables } from '../../classes/query-variable-manager';
import { NaturalHierarchicConfiguration } from '../hierarchic-selector/classes/hierarchic-configuration';

/**
 * Custom template usage :
 * <natural-relations [main]="owner" [service]="svc" [filter]="{}" placeholder="Select an item">
 *     <ng-template let-item="item">
 *         <span>{{ item.xxx }}</span>
 *     </ng-template>
 * </natural-relations>
 */

@Component({
    selector: 'natural-relations',
    templateUrl: './relations.component.html',
    styleUrls: ['./relations.component.scss'],
})
export class NaturalRelationsComponent extends NaturalAbstractController implements OnInit, OnChanges, OnDestroy, ControlValueAccessor {

    @ViewChild(NaturalSelectComponent) select: NaturalSelectComponent;
    @ContentChild(TemplateRef) itemTemplate: TemplateRef<any>;

    @Input() service;
    @Input() placeholder;

    /**
     * Context filter for autocomplete selector
     */
    @Input() autocompleteSelectorFilter;

    /**
     * Function to customize the rendering of the selected item as text in input
     */
    @Input() displayWith: (any) => string;

    /**
     * Whether the relations can be changed
     */
    @Input() disabled: boolean;

    /**
     * Main object relations belong to
     */
    @Input() main;

    /**
     * Cause the component to work as one-to-many instead of many-to-many
     */
    @Input() value: any;

    /**
     * If false, search field is never displayed.
     * If true, search field is smart and only display when number of items > pageSize
     */
    @Input() showSearch = false;

    @Output() selectionChange: EventEmitter<any> = new EventEmitter();

    /**
     * Context filters for hierarchic selector
     */
    @Input() hierarchicSelectorFilters;

    /**
     * Configuration in case we prefer hierarchic selection over autocomplete search
     */
    @Input() hierarchicSelectorConfig: NaturalHierarchicConfiguration[];

    /**
     * Provide service for autocomplete search
     */
    @Input() autocompleteSelectorService: any;

    /**
     *  Hide search field
     */
    @Input() hideSearch = false;

    /**
     * NaturalLinkMutationService usually find the right mutation, by matching type names. But it's
     * not enough when we have the same types on both side of the relation (eg: linkEquipmentEquipment)
     * and reversing the relation is required.
     */
    @Input() reverseRelation: any;
    @Input() otherName: string | null;

    /**
     * Listing service instance
     */
    public dataSource: NaturalDataSource;
    public loading = false;

    /**
     * Table columns
     */
    public displayedColumns = [
        'name',
    ];
    public onChange;
    public onTouched;
    public pageSizeOptions = [5, 10, 50, 100];
    protected defaultPagination: PaginationInput = {
        pageIndex: 0,
        pageSize: 25,
    };
    /**
     * Observable variables/options for listing service usage and apollo watchQuery
     */
    private variablesManager: NaturalQueryVariablesManager<QueryVariables> = new NaturalQueryVariablesManager();

    // TODO : replace <any>
    constructor(private linkMutationService: NaturalLinkMutationService<any>,
                private hierarchicSelectorDialog: NaturalHierarchicSelectorDialogService,
                @Optional() @Self() public ngControl: NgControl) {
        super();

        if (this.ngControl !== null) {
            this.ngControl.valueAccessor = this;
        }
    }

    @Input() set filter(filter) {
        this.variablesManager.merge('relations-context', {filter: filter});
    }

    ngOnInit() {

        this.pagination();

        // Force disabled if cannot update object
        if (this.main && this.main.permissions) {
            this.disabled = this.disabled || !this.main.permissions.update;
        }

        if (!this.disabled) {
            this.displayedColumns.push('unlink');
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        if (this.service) {
            this.queryItems();
        } else if (!this.service && this.value) {
            this.initItems();
        }
    }

    writeValue(value) {
        this.value = value;
    }

    registerOnChange(fn) {
        this.onChange = fn;
    }

    registerOnTouched(fn) {
    }

    /**
     * TODO : replace by natural-search
     * @deprecated when natural-search is used
     */
    public search(searchTerm) {
        const filter = {filter: {groups: [{conditions: [{custom: {search: {value: searchTerm}}}]}]}};
        this.variablesManager.set('controller-variables', filter);
    }

    /**
     * Entry point to remove a relation
     * If one-to-many (with hierarchicConfiguration provided), the given value are affected
     * If many-to-many (with service provided), the link is removed
     */
    public remove(item) {
        if (this.value) {
            this.removeItem(item);
        } else {
            this.removeRelation(item);
        }
    }

    public removeItem(item) {
        const index = this.value.findIndex(i => i.id === item.id);
        const value = this.value.slice(0); // shallow copy
        value.splice(index, 1); // remove one item at specified index
        this.propagateValue(value);
    }

    /**
     * Unlink action
     * Refetch result to display it in table
     */
    public removeRelation(relation) {
        if (!this.reverseRelation) {
            this.linkMutationService.unlink(this.main, relation, this.otherName).subscribe(() => {
            });
        } else {
            this.linkMutationService.unlink(relation, this.main, this.otherName).subscribe(() => {
            });
        }
    }

    public add(item) {
        if (this.value) {
            this.addItem(item);
        } else {
            this.addRelations([item]);
        }
    }

    public addItem(item) {
        const value = this.value.slice(0); // shallow copy to prevent to affect original reference
        value.push(item);
        this.propagateValue(value);
    }

    /**
     * Link action
     * Refetch result to display it in table
     * TODO : could maybe use "update" attribute of apollo.mutate function to update table faster (but hard to do it here)
     */
    public addRelations(relations: any[]) {
        const observables: Observable<FetchResult<{ id: string }>>[] = [];
        relations.forEach(relation => {
            if (!this.reverseRelation) {
                observables.push(this.linkMutationService.link(this.main, relation, this.otherName));
            } else {
                observables.push(this.linkMutationService.link(relation, this.main, this.otherName));
            }
        });

        forkJoin(observables).subscribe(() => {
            if (this.select) {
                this.select.clear(true);
            }
        });
    }

    public pagination(event?: PageEvent) {

        let pagination: QueryVariables['pagination'] = null;
        if (event && (event.pageIndex !== this.defaultPagination.pageIndex || event.pageSize !== this.defaultPagination.pageSize)) {
            pagination = {
                pageIndex: event.pageIndex,
                pageSize: event.pageSize,
            };
        }

        this.variablesManager.merge('pagination', {pagination: pagination ? pagination : this.defaultPagination});
    }

    public getDisplayFn(): (item: any) => string {
        if (this.displayWith) {
            return this.displayWith;
        }

        return (item) => item ? item.fullName || item.name : '';
    }

    public openNaturalHierarchicSelector() {
        const selectAtKey = this.getSelectKey();

        if (!selectAtKey) {
            return;
        }

        const selected = {};
        if (this.value) {
            selected[selectAtKey] = this.value;
        }

        this.hierarchicSelectorDialog.open(this.hierarchicSelectorConfig, true, selected, true, this.hierarchicSelectorFilters)
            .afterClosed()
            .subscribe(selection => {
                if (selection !== undefined) {
                    if (this.value) {
                        this.propagateValue(selection[selectAtKey]);
                    } else if (!this.value && selection[selectAtKey].length) {
                        this.addRelations(selection[selectAtKey]);
                    }
                }
            });
    }

    private initItems() {
        this.dataSource = new NaturalDataSource(this.value);
    }

    /**
     * Get list from database
     */
    private queryItems() {
        this.loading = true;
        const queryRef = this.service.watchAll(this.variablesManager, this.ngUnsubscribe);
        queryRef.subscribe(() => this.loading = false);
        this.dataSource = new NaturalDataSource(queryRef);
    }

    private propagateValue(value) {
        this.value = value;
        this.dataSource.data = value;
        this.onChange(value); // before selectionChange to grant formControl is updated before change is effectively emitted
        this.selectionChange.emit(value);
    }

    private getSelectKey(): string | undefined {
        return this.hierarchicSelectorConfig.filter(c => !!c.selectableAtKey)[0].selectableAtKey;
    }

}
