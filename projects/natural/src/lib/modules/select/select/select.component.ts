import {AfterViewInit, Component, ContentChild, Input, OnDestroy, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {ControlValueAccessor} from '@angular/forms';
import {MatAutocompleteTrigger} from '@angular/material/autocomplete';
import {isObject, merge} from 'lodash-es';
import {Observable} from 'rxjs';
import {debounceTime, distinctUntilChanged, finalize, map, takeUntil} from 'rxjs/operators';
import {PaginatedData} from '../../../classes/data-source';
import {NaturalQueryVariablesManager, QueryVariables} from '../../../classes/query-variable-manager';
import {NaturalAbstractModelService} from '../../../services/abstract-model.service';
import {ExtractTall, Literal} from '../../../types/types';
import {Filter} from '../../search/classes/graphql-doctrine.types';
import {AbstractSelect} from '../abstract-select.component';

/**
 * Default usage:
 * <natural-select [service]="amazingServiceInstance" [(model)]="amazingModel" (modelChange)=amazingChangeFn($event)></natural-select>
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
 */
@Component({
    selector: 'natural-select',
    templateUrl: './select.component.html',
    styleUrls: ['./select.component.scss'],
})
export class NaturalSelectComponent<
        TService extends NaturalAbstractModelService<
            any,
            any,
            PaginatedData<Literal>,
            QueryVariables,
            any,
            any,
            any,
            any,
            any,
            any
        >
    >
    extends AbstractSelect<string | ExtractTall<TService>>
    implements OnInit, OnDestroy, ControlValueAccessor, AfterViewInit {
    @ViewChild(MatAutocompleteTrigger) public autoTrigger!: MatAutocompleteTrigger;
    @ContentChild(TemplateRef) public itemTemplate?: TemplateRef<any>;

    /**
     * Service with watchAll function that accepts queryVariables.
     */
    @Input() public service!: TService;

    /**
     * If false, allows to input free string without selecting an option from autocomplete suggestions
     */
    @Input() public optionRequired = true;

    /**
     * The filter attribute to bind when searching for a term
     */
    @Input() public searchField: 'custom' | string = 'custom';

    /**
     * Additional filter for query
     */
    @Input()
    public set filter(filter: Filter | null | undefined) {
        this.variablesManager.set('additional-filter', {filter: filter});
    }

    /**
     * Items returned by server to show in listing
     */
    public items: null | Observable<any[]> = null;

    /**
     * Whether a we are searching something
     */
    public loading = false;

    /**
     * Storage for auto complete
     */
    public ac: any; // TODO actually not sure if this is needed at all ?

    /**
     * Number of items not shown in result list
     * Shows a message after list if positive
     */
    public moreNbItems = 0;

    /**
     * Default page size
     */
    private pageSize = 10;

    /**
     * Init search options
     */
    private variablesManager = new NaturalQueryVariablesManager<QueryVariables>();

    /**
     * Whether the value can be changed
     */
    @Input() set disabled(disabled: boolean) {
        if (this.formCtrl) {
            disabled ? this.formCtrl.disable() : this.formCtrl.enable();
        }
    }

    public ngAfterViewInit(): void {
        this.formCtrl.valueChanges
            .pipe(takeUntil(this.ngUnsubscribe), distinctUntilChanged(), debounceTime(300))
            .subscribe(val => this.search(val));
    }

    public onInnerFormChange(): void {
        // If we allow free string typing, then we propagate it as it is being typed
        if (!this.optionRequired) {
            this.propagateValue(this.formCtrl.value);
        }
    }

    public ngOnInit(): void {
        super.ngOnInit();
        this.initService();
    }

    private initService(): void {
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
        this.variablesManager.set('variables', variables);
    }

    public startSearch(): void {
        // Start search only once
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

    public propagateValue(value: string | ExtractTall<TService> | null): void {
        this.loading = false;

        // If we cleared value via button, but we allow free string typing, then force to empty string
        if (!this.optionRequired && value === null) {
            value = '';
        }

        super.propagateValue(value);
    }

    /**
     * Very important to return something, above all if [select]='displayedValue' attribute value is used
     */
    public getDisplayFn(): (item: string | ExtractTall<TService> | null) => string {
        if (this.displayWith) {
            return this.displayWith;
        }

        return item => {
            if (!item) {
                return '';
            }

            if (typeof item === 'string') {
                return item;
            }

            return item.fullName || item.name || item.iban || item[this.searchField] || item.id;
        };
    }

    public clear(emitEvent = true): void {
        this.search(null);
        super.clear(emitEvent);
    }

    public search(term: string | ExtractTall<TService> | null): void {
        if (!isObject(term)) {
            if (term) {
                this.loading = !!this.items;
            }

            this.variablesManager.merge('variables', this.getSearchFilter(term));
        }
    }

    public showClearButton(): boolean {
        return this.formCtrl?.enabled && this.clearLabel && this.formCtrl.value;
    }

    private getSearchFilter(term: string | null): QueryVariables {
        let field: Literal = {};

        if (this.searchField === 'custom') {
            field = {custom: term ? {search: {value: term}} : null};
        } else if (term) {
            field[this.searchField] = {like: {value: '%' + term + '%'}};
        }

        return {filter: {groups: [{conditions: [field]}]}};
    }
}
