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
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { FetchResult } from 'apollo-link';
import { forkJoin, Observable } from 'rxjs';
import { NaturalAbstractController } from '../../classes/abstract-controller';
import { NaturalDataSource } from '../../classes/data-source';
import { NaturalQueryVariablesManager, PaginationInput, QueryVariables } from '../../classes/query-variable-manager';
import { HierarchicFiltersConfiguration } from '../../modules/hierarchic-selector/classes/hierarchic-filters-configuration';
import { NaturalLinkMutationService } from '../../services/link-mutation.service';
import { NaturalHierarchicConfiguration } from '../hierarchic-selector/classes/hierarchic-configuration';
import {
    HierarchicDialogConfig,
    HierarchicDialogResult,
} from '../hierarchic-selector/hierarchic-selector-dialog/hierarchic-selector-dialog.component';
import { NaturalSelectComponent } from '../select/select.component';
import {
    NaturalHierarchicSelectorDialogService
} from '../hierarchic-selector/hierarchic-selector-dialog/hierarchic-selector-dialog.service';
import { Filter } from '../search/classes/graphql-doctrine.types';

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

    @ViewChild(NaturalSelectComponent, {static: false}) select: NaturalSelectComponent;
    @ContentChild(TemplateRef, {static: false}) itemTemplate: TemplateRef<any>;

    @Input() service;
    @Input() placeholder;

    /**
     * Context filter for autocomplete selector
     */
    @Input() autocompleteSelectorFilter;

    /**
     * Function to customize the rendering of the selected item as text in input
     */
    @Input() displayWith: (item: any) => string;

    /**
     * Whether the relations can be changed
     */
    @Input() disabled: boolean;

    /**
     * Main object relations belong to
     */
    @Input() main;

    /**
     * If provided, the component works as one-to-many instead of many-to-many
     * This delegates the responsibility of parent component to update on (selectionChange), and linkMutationService wont be used.
     */
    @Input() value: any[];

    @Output() selectionChange: EventEmitter<void> = new EventEmitter<void>();

    /**
     * Context filters for hierarchic selector
     */
    @Input() hierarchicSelectorFilters: HierarchicFiltersConfiguration;

    /**
     * Configuration in case we prefer hierarchic selection over autocomplete selection
     */
    @Input() hierarchicSelectorConfig: NaturalHierarchicConfiguration[];

    /**
     * Provide service for autocomplete selection
     */
    @Input() autocompleteSelectorService: any;

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

    constructor(private linkMutationService: NaturalLinkMutationService,
                private hierarchicSelectorDialog: NaturalHierarchicSelectorDialogService,
                @Optional() @Self() public ngControl: NgControl) {
        super();

        if (this.ngControl !== null) {
            this.ngControl.valueAccessor = this;
        }
    }

    @Input() set filter(filter: Filter) {
        this.variablesManager.set('relations-context', {filter: filter});
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
            this.dataSource = new NaturalDataSource({
                items: this.value,
                length: this.value.length,
                pageIndex: 0,
                pageSize: 0,
            });
        }
    }

    writeValue(value: any[]) {
        this.value = value;
    }

    registerOnChange(fn) {
        this.onChange = fn;
    }

    registerOnTouched(fn) {
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
            this.removeRelation(item).subscribe(() => this.selectionChange.emit());
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
    public removeRelation(relation): Observable<any> {
        if (!this.reverseRelation) {
            return this.linkMutationService.unlink(this.main, relation, this.otherName);
        } else {
            return this.linkMutationService.unlink(relation, this.main, this.otherName);
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
        this.select.clear(true);
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
            this.selectionChange.emit();
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

        this.variablesManager.set('pagination', {pagination: pagination ? pagination : this.defaultPagination});
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

        const hierarchicConfig: HierarchicDialogConfig = {
            hierarchicConfig: this.hierarchicSelectorConfig,
            hierarchicSelection: selected,
            hierarchicFilters: this.hierarchicSelectorFilters,
            multiple: true,
        };

        this.hierarchicSelectorDialog.open(hierarchicConfig)
            .afterClosed()
            .subscribe((result: HierarchicDialogResult) => {
                if (result && result.hierarchicSelection !== undefined) {
                    const selection = result.hierarchicSelection[selectAtKey];
                    if (this.value) {
                        this.propagateValue(selection);
                    } else if (!this.value && selection.length) {
                        this.addRelations(selection);
                    }
                }
            });
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
        this.dataSource.data = value.items ? value : {items: value, length: value.length};
        if (this.onChange) {
            this.onChange(value); // before selectionChange to grant formControl is updated before change is effectively emitted
        }
        this.selectionChange.emit();
    }

    private getSelectKey(): string | undefined {
        return this.hierarchicSelectorConfig.filter(c => !!c.selectableAtKey)[0].selectableAtKey;
    }

}
