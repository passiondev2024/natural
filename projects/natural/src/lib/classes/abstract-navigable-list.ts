import {Directive, Injector, Input, OnDestroy, OnInit} from '@angular/core';
import {NavigationExtras, RouterLink} from '@angular/router';
import {map, takeUntil} from 'rxjs/operators';
import {NaturalSearchSelections} from '../modules/search/types/values';
import {NaturalAbstractModelService} from '../services/abstract-model.service';
import {NaturalAbstractList} from './abstract-list';
import {PaginatedData} from './data-source';
import {NaturalQueryVariablesManager, QueryVariables} from './query-variable-manager';
import {ExtractTall, ExtractTallOne, ExtractVall, Literal} from '../types/types';
import {first, Observable} from 'rxjs';

type BreadcrumbItem = {
    id: string;
    name: string;
} & Literal;

export type NavigableItem<T> = {
    item: T;
    hasNavigation: boolean;
};

/**
 * This class helps managing a list of paginated items that can be filtered,
 * selected, and then bulk actions can be performed on selection.
 *
 * @dynamic
 */
@Directive()
export class NaturalAbstractNavigableList<
        TService extends NaturalAbstractModelService<
            any,
            any,
            PaginatedData<{id: string}>,
            QueryVariables,
            any,
            any,
            any,
            any,
            any,
            any
        >,
    >
    extends NaturalAbstractList<TService, PaginatedData<NavigableItem<ExtractTall<TService>['items'][0]>>>
    implements OnInit, OnDestroy
{
    /**
     * Name of filter for child items to access ancestor item
     */
    @Input() public ancestorRelationName = 'parent';

    private oldAncertorId: string | null = null;

    public breadcrumbs: BreadcrumbItem[] = [];

    public constructor(service: TService, injector: Injector) {
        super(service, injector);
    }

    public override ngOnInit(): void {
        // In fact, "na" and "ns" key may exist at the same time in url (but shouldn't).
        // When this happens, on page reload, search is priority.
        // "na" is a trailing param, and should be considered only when there is no search
        this.route.params.subscribe(params => {
            // "ns" stands for natural-search to be shorter in url
            if (params['ns']) {
                return;
            }

            let navigationConditionValue: any | null = null;

            // "na" stands for "navigation" (relation) in url
            if (params['na']) {
                navigationConditionValue = {have: {values: [params['na']]}};
                this.service.getOne(params['na']).subscribe(
                    // TODO casting should disappear and instead this class should enforce
                    // the service to support Tone with a new generic
                    (ancestor: BreadcrumbItem) => (this.breadcrumbs = this.getBreadcrumb(ancestor)),
                );

                const hasAncestorChanged = params['na'] !== this.oldAncertorId;
                this.oldAncertorId = params['na'];
                this.clearSearch(hasAncestorChanged);
            } else {
                navigationConditionValue = {empty: {}};
                this.breadcrumbs = [];
            }

            const condition: Literal = {};
            condition[this.ancestorRelationName] = navigationConditionValue;
            const variables: QueryVariables = {filter: {groups: [{conditions: [condition]}]}};

            // todo : check why without "as Vall" it errors. Vall is supposed to be QueryVariables, and filter too.
            this.variablesManager.set('navigation', variables as ExtractVall<TService>);
        });

        super.ngOnInit();
    }

    protected override getDataObservable(): Observable<PaginatedData<NavigableItem<ExtractTallOne<TService>>>> {
        return this.service.watchAll(this.variablesManager as unknown as any).pipe(
            takeUntil(this.ngUnsubscribe),
            map(result => {
                // On each data arriving, we query children count to show/hide chevron
                const navigableItems: NavigableItem<ExtractTallOne<TService>>[] = result.items.map(item => {
                    const navigableItem: NavigableItem<ExtractTallOne<TService>> = {
                        item: item as ExtractTallOne<TService>,
                        hasNavigation: false,
                    };

                    const condition: Literal = {};
                    condition[this.ancestorRelationName] = {have: {values: [item.id]}};
                    const variables: QueryVariables = {filter: {groups: [{conditions: [condition]}]}};

                    const qvm = new NaturalQueryVariablesManager();
                    qvm.set('variables', variables);
                    this.service
                        .count(qvm)
                        .pipe(first())
                        .subscribe(count => (navigableItem.hasNavigation = count > 0));

                    return navigableItem;
                });

                const navigableResult: PaginatedData<NavigableItem<ExtractTallOne<TService>>> = {
                    ...result,
                    items: navigableItems,
                };

                return navigableResult;
            }),
        );
    }

    protected override translateSearchAndRefreshList(naturalSearchSelections: NaturalSearchSelections): void {
        // Clear navigation filter if there is a search
        if (naturalSearchSelections.some(s => s.length)) {
            this.variablesManager.set('navigation', null);
            this.breadcrumbs = [];
        }

        super.translateSearchAndRefreshList(naturalSearchSelections);
    }

    public clearSearch(resetPagination = true): void {
        this.naturalSearchSelections = [[]];
        super.search([[]], undefined, resetPagination);
        this.persistenceService.persistInStorage('ns', null, this.getStorageKey());
    }

    public override search(
        naturalSearchSelections: NaturalSearchSelections,
        navigationExtras?: NavigationExtras,
        resetPagination = true,
    ): void {
        // na stands for navigation
        this.persistenceService.persistInUrl('na', null, this.route).then(() => {
            super.search(naturalSearchSelections, navigationExtras, resetPagination);
        });
    }

    /**
     * Return an array for router link usage
     */
    public getChildLink(ancestor: {id: string} | null): RouterLink['routerLink'] {
        if (ancestor && ancestor.id) {
            return ['.', {na: ancestor.id}];
        } else {
            return ['.', {}];
        }
    }

    /**
     * Depth is limited by queries
     * @param item with an ancestor relation (must match ancestorRelationName attribute)
     */
    protected getBreadcrumb(item: BreadcrumbItem): BreadcrumbItem[] {
        const ancestor = item[this.ancestorRelationName];
        if (ancestor) {
            return this.getBreadcrumb(ancestor).concat([item]);
        }

        return [item];
    }
}
