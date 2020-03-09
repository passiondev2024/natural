// tslint:disable:directive-class-suffix
import { SelectionModel } from '@angular/cdk/collections';
import { Injector, Input, OnDestroy, OnInit, Directive } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { ActivatedRoute, Data, Router } from '@angular/router';
import { defaults, isEmpty, isEqual, pick } from 'lodash';
import { Observable, Subject } from 'rxjs';
import { NaturalAlertService } from '../modules/alert/alert.service';
import { NaturalAbstractPanel } from '../modules/panels/abstract-panel';
import { toGraphQLDoctrineFilter } from '../modules/search/classes/graphql-doctrine';
import { fromUrl, toUrl } from '../modules/search/classes/url';
import { NaturalSearchFacets } from '../modules/search/types/facet';
import { NaturalSearchSelections } from '../modules/search/types/values';
import { NaturalAbstractModelService } from '../services/abstract-model.service';
import { NaturalPersistenceService } from '../services/persistence.service';
import { NaturalDataSource, PaginatedData } from './data-source';
import { NaturalQueryVariablesManager, PaginationInput, QueryVariables, Sorting, SortingOrder } from './query-variable-manager';

/**
 * This class helps managing a list of paginated items that can be filtered,
 * selected, and then bulk actions can be performed on selection.
 *
 * Components inheriting from this class can be used as standalone with input attributes.
 *
 * Usage :
 * <natural-my-listing [contextVariables]="{filter:...}" [contextColumns]="['col1']" [persistSearch]="false">
 */

    // @dynamic
@Directive()
export class NaturalAbstractList<Tall extends PaginatedData<any>, Vall extends QueryVariables>
    extends NaturalAbstractPanel
    implements OnInit, OnDestroy {

    /**
     * Contextual initial columns
     * By now can't by changed after initialization
     */
    @Input() contextColumns: string[];

    /**
     *
     */
    @Input() contextService;

    /**
     * Wherever search should be loaded from url/storage and persisted in it too.
     */
    @Input() persistSearch = true;

    /**
     * Columns list after interaction with <natural-columns-picker>
     */
    public selectedColumns: string[] = [];

    /**
     * Initial columns on component init
     */
    public initialColumns: string[];

    /**
     * Source of the list
     */
    public dataSource: NaturalDataSource<Tall['items'][0]>;

    /**
     * Selection for eventual bulk actions
     */
    public selection: SelectionModel<Tall['items'][0]>;

    /**
     * Next executed action from bulk menu
     */
    public bulkActionSelected: string | null;

    /**
     * Centralisation of query variables
     */
    public variablesManager: NaturalQueryVariablesManager<Vall> = new NaturalQueryVariablesManager<Vall>();

    /**
     * Configuration for natural-search facets
     */
    public naturalSearchFacets: NaturalSearchFacets | null;

    /**
     * Result of a search (can be provided as input for initialisation)
     */
    public naturalSearchSelections: NaturalSearchSelections | null = [[]];

    /**
     * Data attribute provided by activated route snapshot
     */
    public routeData: Data;

    /**
     * List of page sizes
     */
    public readonly pageSizeOptions = [
        5,
        10,
        25,
        50,
        100,
        200,
    ];

    /**
     * Initial pagination setup
     */
    protected defaultPagination: Required<PaginationInput> = {
        offset: null,
        pageIndex: 0,
        pageSize: 25,
    };

    /**
     * Initial sorting
     */
    protected defaultSorting: Array<Sorting>;

    protected router: Router;
    protected route: ActivatedRoute;
    protected alertService: NaturalAlertService;
    protected persistenceService: NaturalPersistenceService;

    constructor(
        public service: NaturalAbstractModelService<any, any, Tall, Vall, any, any, any, any, any>,
        private injector: Injector,
    ) {
        super();

        this.router = injector.get(Router);
        this.route = injector.get(ActivatedRoute);
        this.alertService = injector.get(NaturalAlertService);
        this.persistenceService = injector.get(NaturalPersistenceService);
    }

    /**
     * Contextual variables to apply on a list
     */
    @Input() set contextVariables(variables: QueryVariables) {
        this.applyContextVariables(variables);
    }

    /**
     * If change, check DocumentsComponent that overrides this function without calling super.ngOnInit().
     */
    ngOnInit() {
        this.routeData = this.route.snapshot.data;

        this.initFromContext();
        this.initFromPersisted();

        this.variablesManager.defaults('pagination', {pagination: this.defaultPagination} as Vall);
        this.variablesManager.defaults('sorting', {sorting: this.defaultSorting} as Vall);

        this.dataSource = new NaturalDataSource<Tall['items'][0]>(this.getDataObservable());
        this.selection = new SelectionModel<Tall['items'][0]>(true, []);
    }

    /**
     * Persist search and then launch whatever is required to refresh the list
     */
    public search(naturalSearchSelections: NaturalSearchSelections) {

        // Reset page index to restart the pagination (preserve pageSize)
        this.variablesManager.merge('pagination', {pagination: pick(this.defaultPagination, ['offset', 'pageIndex'])} as Vall);

        // Persist if activated
        // Two parallel navigations conflict. We first persist the search, then the pagination
        if (this.persistSearch && !this.isPanel) {
            const promise = this.persistenceService.persist('ns', toUrl(naturalSearchSelections), this.route, this.getStorageKey());

            const pagination = this.getPagination();
            this.pagination(pagination, promise);
        }

        this.translateSearchAndRefreshList(naturalSearchSelections);
    }

    /**
     * Change sorting variables for query and persist in url and local storage the new value
     * The default value not persisted
     * @param sortingEvents List of material sorting events
     */
    public sorting(sortingEvents: Sort[]) {

        // Reset page index to restart the pagination (preserve pageSize)
        this.variablesManager.merge('pagination', {pagination: pick(this.defaultPagination, ['offset', 'pageIndex'])} as Vall);

        // Preserve only sorting events with direction and convert into natural/graphql Sorting type
        let sorting: QueryVariables['sorting'] = sortingEvents.filter(e => !!e.direction)
                                                              .map((sortingEvent) => ({
                                                                  field: sortingEvent.active,
                                                                  order: sortingEvent.direction.toUpperCase(),
                                                              } as Sorting));

        // Empty sorting fallbacks on default
        if (sorting.length === 0) {
            sorting = this.defaultSorting;
        }

        // Set sorting as search variable, adding "id" additionnal to grant order
        this.variablesManager.set('sorting', {sorting: sorting} as Vall);

        if (this.persistSearch && !this.isPanel) {
            // If sorting is equal to default sorting, nullify it to remove from persistence (url and session storage)
            const promise = this.persistenceService.persist('so',
                isEqual(sorting, this.defaultSorting) ? null : sorting,
                this.route,
                this.getStorageKey());

            const pagination = this.getPagination();
            this.pagination(pagination, promise);
        }
    }

    /**
     * Return current pagination, either the user defined one, or the default one
     */
    private getPagination(): PaginationInput {
        const paginationChannel: Partial<Vall> | undefined = this.variablesManager.get('pagination');

        if (paginationChannel && paginationChannel.pagination) {
            // The cast should not be necessary because Typescript correctly narrow down the type to `PaginationInput`
            // but somehow still get confused when returning it
            return paginationChannel.pagination as PaginationInput;
        }

        return this.defaultPagination;
    }

    /**
     * Change pagination variables for query and persist in url and local storage the new value
     * The default value not persisted
     *
     * @param event Natural or Paginator PageEvent
     * @param defer Promise (usually a route promise) that defers the redirection from this call to prevent route navigation collision
     */
    public pagination(event: PaginationInput | PageEvent, defer?: Promise<unknown>): void {

        let pagination: PaginationInput = this.defaultPagination;
        let forPersistence: PaginationInput | null = null;

        // Convert to natural/graphql format, adding missing attributes
        let naturalEvent: PaginationInput = pick(event, Object.keys(this.defaultPagination)); // object with only PaginationInput attributes
        naturalEvent = defaults(naturalEvent, this.defaultPagination); // Default with controller values

        if (!isEqual(naturalEvent, this.defaultPagination)) {
            pagination = forPersistence = naturalEvent;
        }

        this.variablesManager.set('pagination', {pagination} as Vall);

        this.persistPagination(forPersistence, defer);
    }

    protected persistPagination(pagination: PaginationInput | null, defer?: Promise<unknown>) {

        if (this.persistSearch && !this.isPanel) {

            // Declare persist function
            const persist = (value) => this.persistenceService.persist('pa', value, this.route, this.getStorageKey());

            // Call function directly or when promise is resolved
            if (defer) {
                defer.then(() => persist(pagination));
            } else {
                persist(pagination);
            }
        }
    }

    /**
     * Selects all rows if they are not all selected; otherwise clear selection
     */
    public masterToggle(selection: SelectionModel<Tall>, dataSource: NaturalDataSource<Tall['items'][0]>): void {
        if (this.isAllSelected(selection, dataSource)) {
            selection.clear();
        } else {

            if (dataSource.data) {
                dataSource.data.items.forEach(row => {
                    if (row.id) {
                        selection.select(row);
                    }
                });
            }
        }
    }

    /**
     * Whether the number of selected elements matches the total number of rows
     */
    public isAllSelected(selection: SelectionModel<Tall>, dataSource: NaturalDataSource<Tall['items'][0]>): boolean {
        const numSelected = selection.selected.length;
        let numRows = 0;
        if (dataSource.data) {
            dataSource.data.items.forEach(row => {
                if (row.id) {
                    numRows++;
                }
            });
        }

        return numSelected === numRows;
    }

    /**
     * Called when a bulk action is selected
     */
    public bulkAction(): void {
        if (!this.bulkActionSelected || this.bulkActionSelected && !this[this.bulkActionSelected]) {
            throw new Error('Trying to execute a bulk that does not exist: ' + this.bulkActionSelected);
        }

        this[this.bulkActionSelected]();
    }

    /**
     * Header is always visible in non-panel context
     * Is hidden when no results in panels
     */
    public showHeader() {
        return !this.isPanel || this.isPanel && this.showTable();
    }

    /**
     * Search should be visible only when there are is an active search or more than one page
     */
    public showSearch(): boolean {
        return !this.isPanel;
    }

    /**
     * Table should be shown only when there is data
     */
    public showTable(): boolean {
        return this.dataSource && !!this.dataSource.data && this.dataSource.data.length > 0;
    }

    /**
     * No results is shown when there is no items in non-panel context only.
     * In panels we want discret mode, there is no search and no "no-result"
     */
    public showNoResults(): boolean {
        return !this.isPanel && this.dataSource && !!this.dataSource.data && this.dataSource.data.length === 0;
    }

    /**
     * Initialize from routing or input context.
     * Uses data provided by router as route.data.contextXYZ
     * Uses data provided by inputs in usage <natural-xxx [contextXXX]=...>
     */
    protected initFromContext() {

        // Variables
        if (this.route.snapshot.data.contextVariables) {
            this.applyContextVariables(this.route.snapshot.data.contextVariables);
        }

        // Columns
        if (this.contextColumns) {
            this.initialColumns = this.contextColumns;
        }

        if (this.route.snapshot.data.contextColumns) {
            this.initialColumns = this.route.snapshot.data.contextColumns;
        }

        if (!this.injector && (this.routeData.contextService || this.contextService)) {
            console.error('Injector is required to provide a context service in a component that extends AbstractListService');
        }

        // Service
        if (this.injector && this.routeData.contextService) {
            this.service = this.injector.get<any>(this.routeData.contextService);
        }

        if (this.injector && this.contextService) {
            this.service = this.injector.get<any>(this.contextService);
        }
    }

    protected getDataObservable(): Observable<Tall> {
        return this.service.watchAll(this.variablesManager, this.ngUnsubscribe);
    }

    protected initFromPersisted() {

        if (!this.persistSearch || this.isPanel) {
            return;
        }

        const storageKey = this.getStorageKey();

        // Pagination : pa
        const pagination = this.persistenceService.get('pa', this.route, storageKey);
        if (pagination) {
            this.variablesManager.set('pagination', {pagination} as Vall);
        }

        // Sorting : so
        const sorting = this.persistenceService.get('so', this.route, storageKey);
        if (sorting) {
            this.variablesManager.set('sorting', {sorting} as Vall);
        }

        // Natural search : ns
        this.naturalSearchSelections = fromUrl(this.persistenceService.get('ns', this.route, storageKey));
        this.translateSearchAndRefreshList(this.naturalSearchSelections, true);
    }

    protected translateSearchAndRefreshList(naturalSearchSelections: NaturalSearchSelections, ignoreEmptyFilter = false) {
        const filter = toGraphQLDoctrineFilter(this.naturalSearchFacets, naturalSearchSelections);

        if (ignoreEmptyFilter && isEmpty(filter)) {
            return;
        }

        this.variablesManager.set('natural-search', {filter} as Vall);
    }

    /**
     * Return current url excluding last route parameters;
     */
    protected getStorageKey(): string {
        const urlTree = this.router.parseUrl(this.router.url);
        urlTree.root.children.primary.segments[urlTree.root.children.primary.segments.length - 1].parameters = {};
        return urlTree.toString();
    }

    protected bulkdDeleteConfirmation(): Observable<boolean | undefined> {
        return this.alertService.confirm(
            'Suppression',
            'Voulez-vous supprimer définitivement les éléments sélectionnés ?',
            'Supprimer définitivement',
        );
    }

    /**
     * Delete multiple items at once
     */
    protected bulkDelete(): Subject<void> {
        const subject = new Subject<void>();
        this.bulkdDeleteConfirmation().subscribe(confirmed => {
            this.bulkActionSelected = null;
            if (confirmed) {
                this.service.delete(this.selection.selected).subscribe(() => {
                    this.selection.clear();
                    this.alertService.info('Supprimé');
                    subject.next();
                    subject.complete();
                });
            }
        });

        return subject;
    }

    private applyContextVariables(variables: QueryVariables) {

        if (variables.filter) {
            this.variablesManager.set('context-filters', {filter: variables.filter} as Vall);
        }

        if (variables.pagination) {
            this.variablesManager.set('pagination', {pagination: variables.pagination} as Vall);
        }

        if (variables.sorting) {
            this.variablesManager.set('sorting', {sorting: variables.sorting} as Vall);
        }
    }

}
