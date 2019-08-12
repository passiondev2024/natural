import { SelectionModel } from '@angular/cdk/collections';
import { Injector, Input, OnDestroy, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { ActivatedRoute, Data, Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { NaturalAlertService } from '../modules/alert/alert.service';
import { NaturalAbstractPanel } from '../modules/panels/abstract-panel';
import { toGraphQLDoctrineFilter } from '../modules/search/classes/graphql-doctrine';
import { fromUrl, toUrl } from '../modules/search/classes/url';
import { NaturalSearchFacets } from '../modules/search/types/facet';
import { NaturalSearchSelections } from '../modules/search/types/values';
import { NaturalAbstractModelService } from '../services/abstract-model.service';
import { NaturalPersistenceService } from '../services/persistence.service';
import { NaturalDataSource } from './data-source';
import { NaturalQueryVariablesManager, PaginationInput, QueryVariables } from './query-variable-manager';

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
export class NaturalAbstractList<Tall, Vall extends QueryVariables> extends NaturalAbstractPanel implements OnInit, OnDestroy {

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
    public dataSource: NaturalDataSource;

    /**
     * Selection for eventual bulk actions
     */
    public selection: SelectionModel<any>;

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
    protected defaultPagination: PaginationInput = {
        pageIndex: 0,
        pageSize: 25,
    };

    protected router: Router;
    protected route: ActivatedRoute;
    protected alertService: NaturalAlertService;
    protected persistenceService: NaturalPersistenceService;

    constructor(
        protected service: NaturalAbstractModelService<any, any, Tall, Vall, any, any, any, any, any>,
        private injector: Injector,
    ) {
        super();

        this.router = injector.get(Router);
        this.route = injector.get(ActivatedRoute);
        this.alertService = injector.get(NaturalAlertService);
        this.persistenceService = injector.get(NaturalPersistenceService);

        this.variablesManager.set('pagination', {pagination: this.defaultPagination} as Vall);
        this.variablesManager.set('sorting', {sorting: null} as Vall);
    }

    /**
     * Contextual variables to apply on a list
     */
    @Input() set contextVariables(variables: any) {
        this.applyContextVariables(variables);
    }

    public static hasSelections(naturalSearchSelections): boolean {
        return !!naturalSearchSelections.filter(e => e.length).length; // because empty natural search return [[]]
    }

    /**
     * If change, check DocumentsComponent that overrides this function without calling super.ngOnInit().
     */
    ngOnInit() {
        this.routeData = this.route.snapshot.data;

        this.initFromContext();
        this.initFromPersisted();

        this.dataSource = new NaturalDataSource(this.getDataObservable());
        this.selection = new SelectionModel<Tall>(true, []);
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

    /**
     * Persist search and then launch whatever is required to refresh the list
     */
    public search(naturalSearchSelections: NaturalSearchSelections) {
        if (this.persistSearch && !this.isPanel) {
            this.persistenceService.persist('ns', toUrl(naturalSearchSelections), this.route, this.getStorageKey());
        }
        this.translateSearchAndRefreshList(naturalSearchSelections);
    }

    public sorting(event: Sort) {
        let sorting: QueryVariables['sorting'] | null = null;
        if (event.direction) {
            sorting = [
                {
                    field: event.active,
                    order: event.direction.toUpperCase(),
                },
                // Always sort by ID to guarantee predictable sort in case of collision on the other column
                {
                    field: 'id',
                    order: 'ASC',
                },
            ] as QueryVariables['sorting'];
        }

        this.variablesManager.set('sorting', {sorting} as Vall);
        if (this.persistSearch && !this.isPanel) {
            this.persistenceService.persist('so', sorting, this.route, this.getStorageKey());
        }
    }

    public pagination(event: PageEvent) {

        let pagination: QueryVariables['pagination'] = null;
        if (event.pageIndex !== this.defaultPagination.pageIndex || event.pageSize !== this.defaultPagination.pageSize) {
            pagination = {
                pageIndex: event.pageIndex,
                pageSize: event.pageSize,
            };
        }

        this.variablesManager.merge('pagination', {pagination: pagination ? pagination : this.defaultPagination} as Vall);
        if (this.persistSearch && !this.isPanel) {
            this.persistenceService.persist('pa', pagination, this.route, this.getStorageKey());
        }
    }

    /**
     * Selects all rows if they are not all selected; otherwise clear selection
     */
    public masterToggle(selection: SelectionModel<Tall>, dataSource: NaturalDataSource): void {
        if (this.isAllSelected(selection, dataSource)) {
            selection.clear();
        } else {

            if (dataSource.data) {
                dataSource.data.forEach(row => {
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
    public isAllSelected(selection: SelectionModel<Tall>, dataSource: NaturalDataSource): boolean {
        const numSelected = selection.selected.length;
        let numRows = 0;
        if (dataSource.data) {
            dataSource.data.forEach(row => {
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
            this.variablesManager.set('pagination', {pagination: pagination} as Vall);
        }

        // Sorting : so
        const sorting = this.persistenceService.get('so', this.route, storageKey);
        if (sorting) {
            this.variablesManager.set('sorting', {sorting: sorting} as Vall);
        }

        // Natural search : ns
        this.naturalSearchSelections = fromUrl(this.persistenceService.get('ns', this.route, storageKey));
        if (NaturalAbstractList.hasSelections(this.naturalSearchSelections)) {
            this.translateSearchAndRefreshList(this.naturalSearchSelections);
        }

    }

    protected translateSearchAndRefreshList(naturalSearchSelections: NaturalSearchSelections) {
        const translatedSelection = toGraphQLDoctrineFilter(this.naturalSearchFacets, naturalSearchSelections);
        this.variablesManager.set('natural-search', {filter: translatedSelection} as Vall);
    }

    /**
     * Return current url excluding last route parameters;
     */
    protected getStorageKey(): string {
        const urlTree = this.router.parseUrl(this.router.url);
        urlTree.root.children.primary.segments[urlTree.root.children.primary.segments.length - 1].parameters = {};
        return urlTree.toString();
    }

    protected bulkdDeleteConfirmation(): Observable<any> {
        return this.alertService.confirm(
            'Suppression',
            'Voulez-vous supprimer définitivement les éléments sélectionnés ?',
            'Supprimer définitivement',
        );
    }

    /**
     * Delete multiple items at once
     */
    protected bulkDelete(): Subject<any> {
        const subject = new Subject();
        this.bulkdDeleteConfirmation().subscribe(confirmed => {
            this.bulkActionSelected = null;
            if (confirmed) {
                this.service.delete(this.selection.selected as any).subscribe(() => {
                    this.selection.clear();
                    this.alertService.info('Supprimé');
                    subject.next('');
                    subject.complete();
                });
            }
        });

        return subject;
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
        return this.dataSource && this.dataSource.data.length > 0;
    }

    /**
     * No results is shown when there is no items in non-panel context only.
     * In panels we want discret mode, there is no search and no "no-result"
     */
    public showNoResults(): boolean {
        return !this.isPanel && this.dataSource && this.dataSource.data.length === 0;
    }

}
