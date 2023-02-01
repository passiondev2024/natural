import {SelectionModel} from '@angular/cdk/collections';
import {Directive, Injector, Input, OnDestroy, OnInit} from '@angular/core';
import {PageEvent} from '@angular/material/paginator';
import {Sort} from '@angular/material/sort';
import {ActivatedRoute, Data, NavigationEnd, NavigationExtras, NavigationStart, Router} from '@angular/router';
import {defaults, isEmpty, isEqual, pick} from 'lodash-es';
import {Observable, Subject} from 'rxjs';
import {NaturalAlertService} from '../modules/alert/alert.service';
import {NaturalAbstractPanel} from '../modules/panels/abstract-panel';
import {toGraphQLDoctrineFilter} from '../modules/search/classes/graphql-doctrine';
import {fromUrl, toUrl} from '../modules/search/classes/url';
import {NaturalSearchFacets} from '../modules/search/types/facet';
import {NaturalSearchSelections} from '../modules/search/types/values';
import {NaturalAbstractModelService} from '../services/abstract-model.service';
import {NaturalPersistenceService} from '../services/persistence.service';
import {NaturalDataSource, PaginatedData} from './data-source';
import {
    NaturalQueryVariablesManager,
    PaginationInput,
    QueryVariables,
    Sorting,
    SortingOrder,
} from './query-variable-manager';
import {ExtractTall, ExtractVall, Literal} from '../types/types';
import {NavigableItem} from './abstract-navigable-list';
import {filter, takeUntil} from 'rxjs/operators';

type MaybeNavigable = Literal | NavigableItem<Literal>;

function unwrapNavigable(item: MaybeNavigable): Literal {
    if ('item' in item && 'hasNavigation' in item) {
        return item.item;
    }

    return item;
}

/**
 * This class helps managing a list of paginated items that can be filtered,
 * selected, and then bulk actions can be performed on selection.
 *
 * Components inheriting from this class can be used as standalone with input attributes.
 *
 * Usage :
 * <natural-my-listing [forcedVariables]="{filter:...}" [selectedColumns]="['col1']" [persistSearch]="false">
 */

// @dynamic
@Directive()
export class NaturalAbstractList<
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
        // In most case this should not be specified by inheriting classes.
        // It should only be specified to override default if the service items are
        // mapped to a different structure like in NaturalAbstractNavigableList
        Tall extends PaginatedData<MaybeNavigable> = ExtractTall<TService>,
    >
    extends NaturalAbstractPanel
    implements OnInit, OnDestroy
{
    /**
     * Wherever search should be loaded from url/storage and persisted in it too.
     */
    @Input() public persistSearch = true;

    /**
     * Columns list after interaction with <natural-columns-picker>
     */
    public columnsForTable: string[] = [];

    /**
     * The default column selection that automatically happened after <natural-columns-picker> initialization
     */
    private defaultSelectedColumns: string[] | null = null;

    /**
     * Visible (checked) columns
     */
    @Input() public selectedColumns?: string[];

    /**
     * Source of the list
     */
    public dataSource?: NaturalDataSource<Tall>;

    /**
     * Selection for bulk actions
     */
    public readonly selection = new SelectionModel<ExtractTall<TService>['items'][0]>(true, []);

    /**
     * Next executed action from bulk menu
     */
    public bulkActionSelected: string | null = null;

    /**
     * Centralisation of query variables
     */
    public variablesManager: NaturalQueryVariablesManager<ExtractVall<TService>> = new NaturalQueryVariablesManager<
        ExtractVall<TService>
    >();

    /**
     * Configuration for natural-search facets
     */
    public naturalSearchFacets: NaturalSearchFacets = [];

    /**
     * Result of a search (can be provided as input for initialisation)
     */
    public naturalSearchSelections: NaturalSearchSelections = [[]];

    /**
     * Data attribute provided by activated route snapshot
     */
    public routeData?: Data;

    /**
     * List of page sizes
     */
    public readonly pageSizeOptions = [5, 10, 25, 50, 100, 200];

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
    protected defaultSorting?: Array<Sorting>;

    protected router: Router;
    protected route: ActivatedRoute;
    protected alertService: NaturalAlertService;
    protected persistenceService: NaturalPersistenceService;

    public constructor(public readonly service: TService, private readonly injector: Injector) {
        super();

        this.router = injector.get(Router);
        this.route = injector.get(ActivatedRoute);
        this.alertService = injector.get(NaturalAlertService);
        this.persistenceService = injector.get(NaturalPersistenceService);
    }

    /**
     * Variables that are always forced on a list, in addition to whatever the end-user might select
     */
    @Input()
    public set forcedVariables(variables: QueryVariables | null | undefined) {
        if (variables) {
            this.applyForcedVariables(variables);
        }
    }

    /**
     * If change, check DocumentsComponent that overrides this function without calling super.ngOnInit().
     */
    public ngOnInit(): void {
        this.routeData = this.route.snapshot.data;

        this.initFromRoute();
        this.initFromPersisted();

        this.variablesManager.defaults('pagination', {pagination: this.defaultPagination} as ExtractVall<TService>);
        this.variablesManager.defaults('sorting', {sorting: this.defaultSorting} as ExtractVall<TService>);

        this.dataSource = new NaturalDataSource<Tall>(this.getDataObservable());
        this.selection.clear();

        // Update natural search when history changes (back/forward buttons)
        // History state is detectable only on NavigationStart (popstate trigger)
        // But we need parameters from url after NavigationEnd. So proceed in two steps with a flag.
        let isPopState = false;
        this.router.events
            .pipe(
                takeUntil(this.ngUnsubscribe),
                filter(event => event instanceof NavigationStart && event.navigationTrigger === 'popstate'),
            )
            .subscribe(() => {
                isPopState = true;
            });

        this.router.events
            .pipe(
                takeUntil(this.ngUnsubscribe),
                filter(event => event instanceof NavigationEnd && isPopState),
            )
            .subscribe(() => {
                isPopState = false; // reset flag
                this.naturalSearchSelections = fromUrl(this.persistenceService.getFromUrl('ns', this.route));
            });
    }

    /**
     * Persist search and then launch whatever is required to refresh the list
     */
    public search(
        naturalSearchSelections: NaturalSearchSelections,
        navigationExtras?: NavigationExtras,
        resetPagination = true,
    ): void {
        // Reset page index to restart the pagination (preserve pageSize)

        if (resetPagination) {
            this.variablesManager.merge('pagination', {
                pagination: pick(this.defaultPagination, ['offset', 'pageIndex']),
            } as ExtractVall<TService>);
        }

        // Persist if activated
        // Two parallel navigations conflict. We first persist the search, then the pagination
        if (this.persistSearch && !this.isPanel) {
            const promise = this.persistenceService.persist(
                'ns',
                toUrl(naturalSearchSelections),
                this.route,
                this.getStorageKey(),
            );

            const pagination = this.getPagination();
            this.pagination(pagination, promise, navigationExtras);
        }

        this.translateSearchAndRefreshList(naturalSearchSelections);
    }

    /**
     * Change sorting variables for query and persist the new value in url and local storage
     * The default value is not persisted
     * @param sortingEvents List of material sorting events
     */
    public sorting(sortingEvents: (Sort & Partial<Pick<Sorting, 'nullAsHighest'>>)[]): void {
        // Reset page index to restart the pagination (preserve pageSize)
        this.variablesManager.merge('pagination', {
            pagination: pick(this.defaultPagination, ['offset', 'pageIndex']),
        } as ExtractVall<TService>);

        // Preserve only sorting events with direction and convert into natural/graphql Sorting type
        let sorting: Sorting[] = sortingEvents
            .filter(e => !!e.direction)
            .map(sortingEvent => {
                const s: Sorting = {
                    field: sortingEvent.active,
                };

                if (sortingEvent.direction === 'asc') {
                    s.order = SortingOrder.ASC;
                } else if (sortingEvent.direction === 'desc') {
                    s.order = SortingOrder.DESC;
                }

                if ('nullAsHighest' in sortingEvent) {
                    s.nullAsHighest = sortingEvent.nullAsHighest;
                }

                return s;
            });

        // Empty sorting fallbacks on default
        if (sorting.length === 0 && this.defaultSorting) {
            sorting = this.defaultSorting;
        }

        // Set sorting as search variable
        this.variablesManager.set('sorting', {sorting: sorting} as ExtractVall<TService>);

        if (this.persistSearch && !this.isPanel) {
            // If sorting is equal to default sorting, nullify it to remove from persistence (url and session storage)
            const promise = this.persistenceService.persist(
                'so',
                isEqual(sorting, this.defaultSorting) ? null : sorting,
                this.route,
                this.getStorageKey(),
            );

            const pagination = this.getPagination();
            this.pagination(pagination, promise);
        }
    }

    /**
     * Return current pagination, either the user defined one, or the default one
     */
    private getPagination(): PaginationInput {
        const paginationChannel: Partial<ExtractVall<TService>> | undefined = this.variablesManager.get('pagination');

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
     * @param navigationExtras Angular router navigation options. Is relevant only if persistSearch is true
     */
    public pagination(
        event: PaginationInput | PageEvent,
        defer?: Promise<unknown>,
        navigationExtras?: NavigationExtras,
    ): void {
        let pagination: PaginationInput = this.defaultPagination;
        let forPersistence: PaginationInput | null = null;

        // Convert to natural/graphql format, adding missing attributes
        let naturalEvent: PaginationInput = pick(event, Object.keys(this.defaultPagination)); // object with only PaginationInput attributes
        naturalEvent = defaults(naturalEvent, this.defaultPagination); // Default with controller values

        if (!isEqual(naturalEvent, this.defaultPagination)) {
            pagination = forPersistence = naturalEvent;
        }

        this.variablesManager.set('pagination', {pagination} as ExtractVall<TService>);

        this.persistPagination(forPersistence, defer, navigationExtras);
    }

    protected persistPagination(
        pagination: PaginationInput | null,
        defer?: Promise<unknown>,
        navigationExtras?: NavigationExtras,
    ): void {
        if (this.persistSearch && !this.isPanel) {
            // Declare persist function
            const persist = (value: PaginationInput | null): Promise<boolean> =>
                this.persistenceService.persist('pa', value, this.route, this.getStorageKey(), navigationExtras);

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
    public masterToggle(): void {
        if (this.isAllSelected()) {
            this.selection.clear();
        } else {
            this.dataSource?.data?.items.forEach(row => {
                const unwrapped = unwrapNavigable(row);
                if (unwrapped.id) {
                    this.selection.select(unwrapped);
                }
            });
        }
    }

    /**
     * Whether the number of selected elements matches the total number of rows
     */
    public isAllSelected(): boolean {
        const numSelected = this.selection.selected.length;
        let numRows = 0;
        this.dataSource?.data?.items.forEach(row => {
            const unwrapped = unwrapNavigable(row);
            if (unwrapped.id) {
                numRows++;
            }
        });

        return numSelected === numRows;
    }

    /**
     * Called when a bulk action is selected
     */
    public bulkAction(): void {
        if (!this.bulkActionSelected) {
            throw new Error('Trying to execute a bulk action without selecting one');
        }

        if (!(this.bulkActionSelected in this)) {
            throw new Error('Trying to execute a bulk action that does not exist: ' + this.bulkActionSelected);
        }

        (this as any)[this.bulkActionSelected]();
    }

    /**
     * Header is always visible in non-panel context
     * Is hidden when no results in panels
     */
    public showHeader(): boolean {
        return !this.isPanel || (this.isPanel && this.showTable());
    }

    /**
     * Search is visible in most cases, but hidden on a panel
     */
    public showSearch(): boolean {
        return !this.isPanel;
    }

    /**
     * Table should be shown only when there is data
     */
    public showTable(): boolean {
        return !!this.dataSource && !!this.dataSource.data && this.dataSource.data.length > 0;
    }

    /**
     * No results is shown when there is no items, but only in non-panel context only.
     * In panels we want discrete mode, there is no search and no "no-results"
     */
    public showNoResults(): boolean {
        return !this.isPanel && !!this.dataSource && !!this.dataSource.data && this.dataSource.data.length === 0;
    }

    /**
     * Initialize from route.
     *
     * Uses data provided by router such as:
     *
     * - `route.data.forcedVariables`
     * - `route.data.selectedColumns`
     */
    protected initFromRoute(): void {
        // Variables
        if (this.route.snapshot.data.forcedVariables) {
            this.applyForcedVariables(this.route.snapshot.data.forcedVariables);
        }

        // Columns
        if (this.route.snapshot.data.selectedColumns) {
            this.selectedColumns = this.route.snapshot.data.selectedColumns;
        }
    }

    protected getDataObservable(): Observable<Tall> {
        // Here the casting is a bit unfortunate but required because NaturalAbstractNavigableList
        // breaks the data structure convention (by wrapping items in a structure). Ideally we should remove
        // the casting and resolve things in a better way, but that's too much work for now
        return this.service
            .watchAll(this.variablesManager as unknown as any)
            .pipe(takeUntil(this.ngUnsubscribe)) as unknown as Observable<Tall>;
    }

    protected initFromPersisted(): void {
        if (!this.persistSearch || this.isPanel) {
            return;
        }

        const storageKey = this.getStorageKey();

        // Pagination : pa
        const pagination = this.persistenceService.get('pa', this.route, storageKey);
        if (pagination) {
            this.variablesManager.set('pagination', {pagination} as ExtractVall<TService>);
        }

        // Sorting : so
        const sorting = this.persistenceService.get('so', this.route, storageKey);
        if (sorting) {
            this.variablesManager.set('sorting', {sorting} as ExtractVall<TService>);
        }

        // Columns
        const persistedColumns = this.persistenceService.get('col', this.route, storageKey);
        if (typeof persistedColumns === 'string') {
            this.selectedColumns = persistedColumns.split(',');
        }

        // Natural search : ns
        this.naturalSearchSelections = fromUrl(this.persistenceService.get('ns', this.route, storageKey));
        this.translateSearchAndRefreshList(this.naturalSearchSelections, true);
    }

    protected translateSearchAndRefreshList(
        naturalSearchSelections: NaturalSearchSelections,
        ignoreEmptyFilter = false,
    ): void {
        const filter = toGraphQLDoctrineFilter(this.naturalSearchFacets, naturalSearchSelections);

        if (ignoreEmptyFilter && isEmpty(filter)) {
            return;
        }

        this.variablesManager.set('natural-search', {filter} as ExtractVall<TService>);
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
            $localize`Suppression`,
            $localize`Voulez-vous supprimer définitivement les éléments sélectionnés ?`,
            $localize`Supprimer définitivement`,
        );
    }

    /**
     * Delete multiple items at once
     */
    protected bulkDelete(): Observable<void> {
        const subject = new Subject<void>();
        this.bulkdDeleteConfirmation().subscribe(confirmed => {
            this.bulkActionSelected = null;
            if (confirmed) {
                // Assume that our objects have ID. This is true in almost all cases. But if
                // it is not, like AttributeReportComponent, then the inheriting class must
                // never call this method.
                const selection = this.selection.selected as {id: string}[];

                this.service.delete(selection).subscribe(() => {
                    this.selection.clear();
                    this.alertService.info($localize`Supprimé`);
                    subject.next();
                    subject.complete();
                });
            }
        });

        return subject;
    }

    private applyForcedVariables(variables: QueryVariables): void {
        if (variables.filter) {
            this.variablesManager.set('forced-filter', {filter: variables.filter} as ExtractVall<TService>);
        }

        if (variables.pagination) {
            this.variablesManager.set('pagination', {pagination: variables.pagination} as ExtractVall<TService>);
        }

        if (variables.sorting) {
            this.variablesManager.set('sorting', {sorting: variables.sorting} as ExtractVall<TService>);
        }
    }

    public selectColumns(columns: string[]): void {
        this.columnsForTable = columns;

        if (!this.persistSearch || this.isPanel) {
            return;
        }

        // The first selection we receive is the default one made by <natural-columns-picker>
        if (!this.defaultSelectedColumns) {
            this.defaultSelectedColumns = columns;
        } else {
            // Persist only if wanted columns are different from default selection
            const value = isEqual(this.defaultSelectedColumns, columns) ? null : columns.join(',');
            this.persistenceService.persist('col', value, this.route, this.getStorageKey());
        }
    }
}
