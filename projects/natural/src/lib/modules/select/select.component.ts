import {
    AfterViewInit,
    Component,
    ContentChild,
    ElementRef,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Optional,
    Output,
    Self,
    TemplateRef,
    ViewChild,
} from '@angular/core';
import {ControlValueAccessor, FormControl, NgControl} from '@angular/forms';
import {MatDialogConfig} from '@angular/material/dialog';
import {MatAutocompleteTrigger} from '@angular/material/autocomplete';
import {isObject, merge} from 'lodash';
import {Observable} from 'rxjs';
import {debounceTime, distinctUntilChanged, finalize, map, takeUntil} from 'rxjs/operators';
import {NaturalAbstractController} from '../../classes/abstract-controller';
import {NaturalQueryVariablesManager, QueryVariables} from '../../classes/query-variable-manager';
import {NaturalHierarchicConfiguration} from '../hierarchic-selector/classes/hierarchic-configuration';
import {HierarchicFiltersConfiguration} from '../hierarchic-selector/classes/hierarchic-filters-configuration';
import {
    HierarchicDialogConfig,
    HierarchicDialogResult,
} from '../hierarchic-selector/hierarchic-selector-dialog/hierarchic-selector-dialog.component';
import {NaturalHierarchicSelectorDialogService} from '../hierarchic-selector/hierarchic-selector-dialog/hierarchic-selector-dialog.service';
import {Filter} from '../search/classes/graphql-doctrine.types';
import {PaginatedData} from '../../classes/data-source';
import {NaturalAbstractModelService} from '../../services/abstract-model.service';

/**
 * Default usage:
 * <natural-select [service]="amazingServiceInstance" [(model)]="amazingModel" (modelChange)=amazingChangeFn($event)></natural-select>
 * <natural-select [hierarchicSelectorConfig]="myConfig" [(ngModel)]="amazingModel"
 * (ngModelChange)=amazingChangeFn($event)></natural-select>
 *
 * Custom template usage :
 * <natural-select [service]="svc" [(ngModel)]="model">
 *     <ng-template let-item="item">
 *         <span>{{ item.xxx }}</span>
 *     </ng-template>
 * </natural-select>
 *
 * [(ngModel)] and (ngModelChange) are optional
 *
 * Placeholder :
 * <natural-select placeholder="amazing placeholder">
 *
 * Never float placeholder :
 * <natural-select placeholder="amazing placeholder" floatPlaceholder="never">
 *
 * Search with like %xxx% on specified attribute name instead of custom filter on whole object
 * <natural-select [searchField]="string">
 *
 * Allows to input free string without selecting an option from autocomplete suggestions
 * <natural-select [optionRequired]="false">
 *
 */
@Component({
    selector: 'natural-select',
    templateUrl: './select.component.html',
    styleUrls: ['./select.component.scss'],
})
export class NaturalSelectComponent extends NaturalAbstractController
    implements OnInit, OnDestroy, ControlValueAccessor, AfterViewInit {
    @ViewChild(MatAutocompleteTrigger) autoTrigger: MatAutocompleteTrigger;
    @ViewChild('input') input: ElementRef<HTMLInputElement>;
    @ContentChild(TemplateRef) itemTemplate: TemplateRef<any>;

    /**
     * Service with watchAll function that accepts queryVariables.
     */
    @Input() service: null | NaturalAbstractModelService<any, any, PaginatedData<any>, any, any, any, any, any, any>;
    @Input() placeholder: string;
    @Input() floatPlaceholder: string | null = null;
    @Input() required = false;
    @Input() optionRequired = true;

    /**
     * Add a suffix button that is a link to given destination
     */
    @Input() navigateTo;

    /**
     * If provided cause a new clear button to appear
     */
    @Input() clearLabel: string;

    /**
     * If provided cause a new select button to appear
     */
    @Input() selectLabel: string;

    /**
     * The filter attribute to bind when searching for a term
     */
    @Input() searchField: 'custom' | string = 'custom';

    /**
     * Whether to show the search icon
     */
    @Input() showIcon = true;

    /**
     * Icon name
     */
    @Input() icon = 'search';

    /**
     * Filters formatted for hierarchic selector
     */
    @Input() hierarchicSelectorFilters: HierarchicFiltersConfiguration;

    /**
     * Configuration for hierarchic relations
     */
    @Input() hierarchicSelectorConfig: NaturalHierarchicConfiguration[];

    /**
     * Additional filter for query
     */
    @Input() filter: Filter = {};

    /**
     * Function to customize the rendering of the selected item as text in input
     */
    @Input() displayWith: (item: any) => string;

    /**
     *
     */
    @Output() selectionChange = new EventEmitter();

    /**
     * Emits when inner input is blurred
     */
    @Output() blur = new EventEmitter<void>();

    /**
     * Items returned by server to show in listing
     */
    public items: null | Observable<any[]>;

    /**
     *
     */
    public formCtrl: FormControl;

    /**
     *
     */
    public loading = false;

    /**
     * Storage for auto complete
     */
    public ac;

    /**
     * Number of items not shown in result list
     * Shows a message after list if positive
     */
    public moreNbItems = 0;

    /**
     * Interface with ControlValueAccessor
     * Notifies parent model / form controller
     */
    private onChange;

    /**
     * Default page size
     */
    private pageSize = 10;

    /**
     * Init search options
     */
    private variablesManager: NaturalQueryVariablesManager<QueryVariables>;

    /**
     * Stores the value given from parent, it's usually an object. The inner value is formCtrl.value that is a string.
     */
    private value;

    /**
     * On firefox, the combination of <input (focus)> event and dialog opening cause some strange bug where focus event is called multiple
     * times This prevents it.
     */
    private lockOpenDialog = false;

    constructor(
        private readonly hierarchicSelectorDialogService: NaturalHierarchicSelectorDialogService,
        @Optional() @Self() public readonly ngControl: NgControl,
    ) {
        super();

        if (this.ngControl) {
            this.ngControl.valueAccessor = this;
        }
    }

    /**
     * Whether the value can be changed
     */
    @Input() set disabled(disabled: boolean) {
        disabled ? this.formCtrl.disable() : this.formCtrl.enable();
    }

    public ngAfterViewInit(): void {
        this.formCtrl.valueChanges
            .pipe(takeUntil(this.ngUnsubscribe), distinctUntilChanged(), debounceTime(300))
            .subscribe(val => {
                this.search(val);
            });
    }

    public onInnerFormChange() {
        if (this.formCtrl.value && !this.optionRequired) {
            this.propagateValue(this.formCtrl.value);
        }
    }

    public writeValue(value): void {
        this.value = value;
    }

    public registerOnChange(fn): void {
        this.onChange = fn;
    }

    public registerOnTouched(fn): void {}

    public ngOnInit(): void {
        // Try to use formControl from [(ngModel)] or [formControl], otherwise create our own control
        if (this.ngControl?.control instanceof FormControl) {
            this.formCtrl = this.ngControl.control;
        } else {
            this.formCtrl = new FormControl();
        }

        this.initService();
    }

    private initService(): void {
        if (!this.service) {
            return;
        }

        // Assert given service has a watchAll function
        if (typeof this.service.watchAll !== 'function') {
            throw new TypeError('Provided service does not contain watchAll function');
        }

        const defaultPagination = {
            pagination: {
                pageIndex: 0,
                pageSize: this.pageSize,
            },
        };

        const variables = merge(defaultPagination, this.getSearchFilter(null));

        this.variablesManager = new NaturalQueryVariablesManager<QueryVariables>();
        this.variablesManager.merge('additional-filter', {filter: this.filter});
        this.variablesManager.set('variables', variables);
    }

    public startSearch(): void {
        if (!this.service) {
            return;
        }

        /**
         * Start search only once
         */
        if (this.items) {
            return;
        }

        // Init query, and when query results arrive, finish loading, and count items
        this.items = this.service.watchAll(this.variablesManager, this.ngUnsubscribe).pipe(
            takeUntil(this.ngUnsubscribe),
            finalize(() => (this.loading = false)),
            map(data => {
                this.loading = false;
                const nbTotal = data.length;
                const nbListed = Math.min(data.length, this.pageSize);
                this.moreNbItems = nbTotal - nbListed;

                return data.items;
            }),
        );

        this.loading = true;
        this.items.subscribe();
    }

    public propagateValue(event): void {
        this.loading = false;
        let value = event && event.option ? event.option.value : event;

        if (!this.optionRequired && value === null) {
            value = '';
        }

        this.value = value;
        if (this.onChange) {
            this.onChange(value); // before selectionChange to allow formControl to update before change is effectively emitted
        }

        this.selectionChange.emit(value);
    }

    /**
     * Very important to return something, above all if [select]='displayedValue' attribute value is used
     */
    public getDisplayFn(): (item: any) => string {
        if (this.displayWith) {
            return this.displayWith;
        }

        return item =>
            !item ? null : item.fullName || item.name || item.iban || item[this.searchField] || item.id || item;
    }

    public clear(preventChangeValue = false) {
        this.search(null);

        // Empty input
        this.formCtrl.setValue(null, {emitEvent: !preventChangeValue});

        // propagateValue change
        if (!preventChangeValue) {
            this.propagateValue(null);
        }
    }

    public search(term) {
        if (this.service && !isObject(term)) {
            if (term) {
                this.loading = !!this.items;
            }

            this.variablesManager.merge('variables', this.getSearchFilter(term));
        }
    }

    public setDisabledState(isDisabled: boolean): void {}

    public openDialog(): void {
        if (this.lockOpenDialog) {
            return;
        }

        this.lockOpenDialog = true;

        if (this.formCtrl.disabled || !this.hierarchicSelectorConfig) {
            return;
        }

        const selectAtKey = this.getSelectKey();

        if (!selectAtKey) {
            return;
        }

        const selected = {};

        if (this.value) {
            selected[selectAtKey] = [this.value];
        }

        const hierarchicConfig: HierarchicDialogConfig = {
            hierarchicConfig: this.hierarchicSelectorConfig,
            hierarchicSelection: selected,
            hierarchicFilters: this.hierarchicSelectorFilters,
            multiple: false,
        };

        const dialogFocus: MatDialogConfig = {
            restoreFocus: false,
        };

        this.hierarchicSelectorDialogService
            .open(hierarchicConfig, dialogFocus)
            .afterClosed()
            .subscribe((result: HierarchicDialogResult) => {
                this.lockOpenDialog = false;
                if (result && result.hierarchicSelection) {
                    const selection = result.hierarchicSelection;
                    // Find the only selection amongst all possible keys
                    const keyWithSelection = Object.keys(selection).find(key => selection[key][0]);
                    const singleSelection = keyWithSelection ? selection[keyWithSelection][0] : null;

                    this.formCtrl.setValue(this.getDisplayFn()(singleSelection));
                    this.propagateValue(singleSelection);
                }
            });
    }

    public showSelectButton() {
        return this.formCtrl?.enabled && this.selectLabel && this.hierarchicSelectorConfig;
    }

    public showClearButton() {
        return this.formCtrl?.enabled && this.clearLabel && this.formCtrl.value;
    }

    private getSearchFilter(term: string | null): any {
        let field = {};

        if (this.searchField === 'custom') {
            field = {custom: term ? {search: {value: term}} : null};
        } else if (term) {
            field[this.searchField] = {like: {value: '%' + term + '%'}};
        }

        return {filter: {groups: [{conditions: [field]}]}};
    }

    private getSelectKey() {
        return this.hierarchicSelectorConfig.filter(c => !!c.selectableAtKey)[0].selectableAtKey;
    }
}
