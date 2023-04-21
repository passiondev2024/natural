import {AfterViewInit, Component, ContentChild, Input, OnDestroy, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {ControlValueAccessor} from '@angular/forms';
import {MatAutocompleteTrigger} from '@angular/material/autocomplete';
import {merge} from 'lodash-es';
import {Observable} from 'rxjs';
import {debounceTime, distinctUntilChanged, finalize, map, takeUntil} from 'rxjs/operators';
import {PaginatedData} from '../../../classes/data-source';
import {NaturalQueryVariablesManager, QueryVariables} from '../../../classes/query-variable-manager';
import {NaturalAbstractModelService} from '../../../services/abstract-model.service';
import {ExtractTallOne, ExtractVall, Literal} from '../../../types/types';
import {AbstractSelect} from '../abstract-select.component';

type V<TService> = string | ExtractTallOne<TService>;

/**
 * Default usage:
 * ```html
 * <natural-select [service]="myServiceInstance" [(model)]="myModel" (modelChange)=myChangeFn($event)></natural-select>
 * ```
 *
 * Custom template usage :
 * ```html
 * <natural-select [service]="svc" [(ngModel)]="model">
 *     <ng-template let-item="item">
 *         <span>{{ item.xxx }}</span>
 *     </ng-template>
 * </natural-select>
 * ```
 *
 * `[(ngModel)]` and `(ngModelChange)` are optional.
 *
 * Placeholder :
 * ```html
 * <natural-select placeholder="my placeholder"></natural-select>
 * ```
 *
 * Search with like %xxx% on specified field `name` instead of custom filter on whole object
 * ```html
 * <natural-select searchField="name"></natural-select>
 * ```
 *
 * Allows to input free string without selecting an option from autocomplete suggestions
 * ```html
 * <natural-select [optionRequired]="false"></natural-select>
 * ```
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
        >,
    >
    extends AbstractSelect<V<TService>, V<TService>>
    implements OnInit, OnDestroy, ControlValueAccessor, AfterViewInit
{
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
     * The field on which to search for, default to 'custom'.
     */
    @Input() public searchField: 'custom' | string = 'custom';

    /**
     * The operator with which to search for, default to 'search' if `searchField` is 'custom', else 'like'.
     */
    @Input() public searchOperator: 'search' | string | null = null;

    /**
     * Cache the committed value during search mode.
     * It's used to be restored in case we cancel the selection
     */
    private lastValidValue: V<TService> | null = null;

    /**
     * Additional filter for query
     */
    @Input()
    public set filter(filter: ExtractVall<TService>['filter'] | null | undefined) {
        this.variablesManager.set('additional-filter', {filter: filter});
    }

    /**
     * Items returned by server to show in listing
     */
    public items: null | Observable<readonly any[]> = null;

    /**
     * Whether we are searching something
     */
    public loading = false;

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
    @Input()
    public override set disabled(disabled: boolean) {
        disabled ? this.internalCtrl.disable() : this.internalCtrl.enable();
    }

    public ngAfterViewInit(): void {
        this.internalCtrl.valueChanges
            .pipe(takeUntil(this.ngUnsubscribe), distinctUntilChanged(), debounceTime(300))
            .subscribe(val => this.search(val));
    }

    public onInternalFormChange(): void {
        // If we allow free string typing, then we propagate it as it is being typed
        if (!this.optionRequired) {
            this.propagateValue(this.internalCtrl.value);
        }
    }

    public override ngOnInit(): void {
        super.ngOnInit();
        this.initService();
    }

    public override onBlur(): void {
        if (this.internalCtrl.dirty) {
            this.reset();
        }
        super.onBlur();
    }

    /**
     * Reset form to it's initial value
     * Discard searched text (in autocomplete use case)
     * Doest not commit the change to the model (no change event is emitted)
     */
    public reset(): void {
        this.internalCtrl.setValue(this.lastValidValue);
        this.internalCtrl.markAsPristine();
    }

    /**
     * Reset form = remove searched text and display committed model value
     */
    public onKeyEscape(): void {
        this.reset();
    }

    /**
     * Enter semantic means we want to validate something.
     * If we hit ENTER while typing a text, the stroke is ignored because the value is invalid (it's accepted in free text mode)
     * If we hit ENTER while the input field is empty, we validate the unselection (empty is a valid value)
     */
    public onKeyEnter(): void {
        if (!this.internalCtrl.value) {
            this.clear();
            this.autoTrigger.closePanel();
        }
    }

    public override writeValue(value: V<TService> | null): void {
        super.writeValue(value);
        this.lastValidValue = this.internalCtrl.value;
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
        this.items = this.service.watchAll(this.variablesManager).pipe(
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

    /**
     * Commit the model change
     * Set internal form as pristine to reflect that the visible value match the model
     */
    public override propagateValue(value: V<TService> | null): void {
        this.internalCtrl.markAsPristine();
        this.lastValidValue = this.internalCtrl.value;
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
    public getDisplayFn(): (item: V<TService> | null) => string {
        if (this.displayWith) {
            return this.displayWith;
        }

        return (item: any) => {
            if (!item) {
                return '';
            }

            if (typeof item === 'string') {
                return item;
            }

            return item.fullName || item.name || item.iban || item[this.searchField] || item.id;
        };
    }

    public override clear(): void {
        this.search(null);
        super.clear();
    }

    public search(term: V<TService> | null): void {
        if (typeof term === 'string' || term === null) {
            if (term) {
                this.loading = !!this.items;
            }

            this.variablesManager.merge('variables', this.getSearchFilter(term));
        }
    }

    public override showClearButton(): boolean {
        return this.internalCtrl?.enabled && !!this.clearLabel && !!this.internalCtrl.value;
    }

    private getSearchFilter(term: string | null): QueryVariables {
        const searchOperator = this.searchOperator ?? (this.searchField === 'custom' ? 'search' : 'like');
        if (term && searchOperator === 'like') {
            term = '%' + term + '%';
        }

        return {
            filter: {
                groups: [
                    {
                        conditions: [
                            {
                                [this.searchField]: term
                                    ? {
                                          [searchOperator]: {value: term},
                                      }
                                    : null,
                            },
                        ],
                    },
                ],
            },
        };
    }

    public getVariablesForDebug(): Readonly<QueryVariables> | undefined {
        return this.variablesManager.variables.value;
    }
}
