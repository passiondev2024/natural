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
import { ControlValueAccessor, FormControl, NgControl } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { isObject, merge } from 'lodash';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, takeUntil } from 'rxjs/operators';
import { NaturalAbstractController } from '../../classes/abstract-controller';
import { NaturalFormControl } from '../../classes/form-control';
import { NaturalQueryVariablesManager, QueryVariables } from '../../classes/query-variable-manager';
import { NaturalHierarchicConfiguration } from '../hierarchic-selector/classes/hierarchic-configuration';
import { HierarchicFiltersConfiguration } from '../hierarchic-selector/classes/hierarchic-filters-configuration';
import { NaturalHierarchicSelectorDialogService } from '../hierarchic-selector/services/hierarchic-selector-dialog.service';
import { OrganizedModelSelection } from '../hierarchic-selector/services/hierarchic-selector.service';

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
export class NaturalSelectComponent extends NaturalAbstractController implements OnInit, OnDestroy, ControlValueAccessor, AfterViewInit {

    @ViewChild(MatAutocompleteTrigger, {static: false}) autoTrigger: MatAutocompleteTrigger;
    @ViewChild('input', {static: false}) input: ElementRef<HTMLInputElement>;
    @ContentChild(TemplateRef, {static: false}) itemTemplate: TemplateRef<any>;

    /**
     * Service with watchAll function that accepts queryVariables.
     */
    @Input() service;
    @Input() placeholder: string;
    @Input() floatPlaceholder: string | null = null;
    @Input() required = false;
    @Input() optionRequired = true;
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
    @Input() icon = 'search';

    /**
     * Filters formatted for hierarchic selector
     */
    @Input() hierarchicSelectorFilters: HierarchicFiltersConfiguration;

    @Input() hierarchicSelectorConfig: NaturalHierarchicConfiguration[];

    /**
     * Additional filter for query
     */
    @Input() filter: QueryVariables['filter'] = {};

    /**
     * Function to customize the rendering of the selected item as text in input
     */
    @Input() displayWith: (item: any) => string;
    @Output() selectionChange = new EventEmitter();
    @Output() blur = new EventEmitter();
    /**
     * Items returned by server to show in listing
     */
    public items: Observable<any[]>;
    public formCtrl: FormControl = new FormControl();
    public loading = false;
    public ac;
    /**
     * Number of items not shown in result list
     * Shows a message after list if positive
     */
    public moreNbItems = 0;
    public onChange;
    private queryRef: Observable<any>;
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

    constructor(private hierarchicSelectorDialogService: NaturalHierarchicSelectorDialogService,
                @Optional() @Self() public ngControl: NgControl) {

        super();

        if (this.ngControl !== null) {
            this.ngControl.valueAccessor = this;
        }
    }

    /**
     * Whether the disabled can be changed
     */
    @Input() set disabled(disabled: boolean) {
        disabled ? this.formCtrl.disable() : this.formCtrl.enable();
    }

    ngAfterViewInit(): void {

        if (this.ngControl && this.ngControl.control) {
            if ((this.ngControl.control as NaturalFormControl).dirtyChanges) {
                (this.ngControl.control as NaturalFormControl).dirtyChanges.subscribe(() => {
                    this.formCtrl.markAsDirty({onlySelf: true});
                    this.formCtrl.updateValueAndValidity();
                });
            }

            this.formCtrl.setValidators(this.ngControl.control.validator);
        }

        this.formCtrl.valueChanges.pipe(takeUntil(this.ngUnsubscribe), distinctUntilChanged(), debounceTime(300)).subscribe((val) => {
            this.search(val);
            this.propagateErrors();
        });

    }

    public onInnerFormChange() {
        if (this.formCtrl.value && !this.optionRequired) {
            this.propagateValue(this.formCtrl.value);
        }
    }

    writeValue(value) {
        this.value = value;
        this.formCtrl.setValue(this.getDisplayFn()(value));
    }

    registerOnChange(fn) {
        this.onChange = fn;
    }

    registerOnTouched(fn) {
    }

    ngOnInit() {

        if (!this.service) {
            return;
        }

        // Grants given service has a watchAll function/
        // TODO : Could perform better tests to grant the service accepts observable queryVariables as first paremeter
        if (typeof this.service.watchAll !== 'function') {
            throw new TypeError('Provided service does not contain watchAll function');
        }

        let variables = {
            pagination: {
                pageIndex: 0,
                pageSize: this.pageSize,
            },
        };

        variables = merge(variables, this.getSearchFilter(null));

        this.variablesManager = new NaturalQueryVariablesManager<QueryVariables>();
        this.variablesManager.merge('additional-filter', {filter: this.filter});
        this.variablesManager.set('variables', variables);
    }

    public propagateErrors() {
        if (this.ngControl && this.ngControl.control) {
            this.ngControl.control.setErrors(this.formCtrl.errors);
        }
    }

    public onFocus() {
        this.startSearch();
    }

    public startSearch() {

        if (!this.service) {
            return;
        }

        /**
         * Start search only once
         */
        if (this.queryRef) {
            return;
        }

        // Init query
        this.queryRef = this.service.watchAll(this.variablesManager, this.ngUnsubscribe);

        // When query results arrive, start loading, and count items
        this.queryRef.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
            this.loading = false;
            const nbTotal = data.length;
            const nbListed = Math.min(data.length, this.pageSize);
            this.moreNbItems = nbTotal - nbListed;
        });

        this.items = this.queryRef.pipe(map((data: any) => data.items ? data.items : data));
    }

    public propagateValue(ev) {
        let val = ev && ev.option ? ev.option.value : ev;

        if (!this.optionRequired && val === null) {
            val = '';
        }

        this.value = val;
        if (this.onChange) {
            this.onChange(val); // before selectionChange to grant formControl is updated before change is effectively emitted
        }
        this.selectionChange.emit(val);
    }

    /**
     * Very important to return something, above all if [select]='displayedValue' attribute value is used
     */
    public getDisplayFn(): (item: any) => string {
        if (this.displayWith) {
            return this.displayWith;
        }

        return (item) => !item ? null : item.fullName || item.name || item.iban || item[this.searchField] || item.id || item;
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
            this.loading = !!this.queryRef;
            this.variablesManager.merge('variables', this.getSearchFilter(term));
        }
    }

    public setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    public openDialog(): void {

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

        this.hierarchicSelectorDialogService.open(this.hierarchicSelectorConfig,
            false,
            selected,
            true,
            this.hierarchicSelectorFilters,
            false)
            .afterClosed()
            .subscribe((selection: OrganizedModelSelection) => {
                if (selection) {
                    // Find the only selection amongst all possible keys
                    const keyWithSelection = Object.keys(selection).find(key => selection[key][0]);
                    const singleSelection = keyWithSelection ? selection[keyWithSelection][0] : null;

                    this.formCtrl.setValue(this.getDisplayFn()(singleSelection));
                    this.propagateValue(singleSelection);
                }
            });
    }

    public showSelectButton() {
        return this.hierarchicSelectorConfig && this.formCtrl.enabled && this.selectLabel;
    }

    public showClearButton() {
        return this.formCtrl.value && this.formCtrl.enabled && this.clearLabel;
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
