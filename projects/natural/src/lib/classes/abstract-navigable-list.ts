// tslint:disable:directive-class-suffix
import { Directive, Injector, Input, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { NaturalSearchSelections } from '../modules/search/types/values';
import { NaturalAbstractModelService } from '../services/abstract-model.service';
import { NaturalAbstractList } from './abstract-list';
import { PaginatedData } from './data-source';
import { NaturalQueryVariablesManager, QueryVariables } from './query-variable-manager';

interface BreadcrumbItem {
    name: string;
}

/**
 * This class helps managing a list of paginated items that can be filtered,
 * selected, and then bulk actions can be performed on selection.
 */
@Directive()
export class NaturalAbstractNavigableList<Tall extends PaginatedData<any>, Vall extends QueryVariables>
    extends NaturalAbstractList<Tall, Vall> implements OnInit, OnDestroy {

    /**
     * Name of filter for child items to access ancestor item
     */
    @Input() ancestorRelationName = 'parent';

    public breadcrumbs: BreadcrumbItem[] = [];

    constructor(service: NaturalAbstractModelService<any, any, any, any, any, any, any, any, any>, injector: Injector) {
        super(service, injector);
    }

    ngOnInit(): void {

        // In fact, "na" and "ns" key may exist at the same time in url (but shouldn't).
        // When this happens, on page reload, search is priority.
        // "na" is a trailing param, and should be considered only when there is no search
        this.route.params.subscribe(params => {

            // "ns" stands for natural-search to be shorter in url
            if (!params['ns']) {

                let navigationConditionValue: any | null = null;

                // "na" stands for "navigation" (relation) in url
                if (params['na']) {

                    navigationConditionValue = {have: {values: [params['na']]}};
                    this.service.getOne(params['na']).subscribe(
                        // TODO casting should disappear and instead this class should enforce
                        // the service to support Tone with a new generic
                        (ancestor: BreadcrumbItem) => this.breadcrumbs = this.getBreadcrumb(ancestor),
                    );
                    this.clearSearch();

                } else {
                    navigationConditionValue = {empty: {}};
                    this.breadcrumbs = [];
                }

                const condition = {};
                condition[this.ancestorRelationName] = navigationConditionValue;
                const variables: QueryVariables = {filter: {groups: [{conditions: [condition]}]}};

                // todo : check why without "as Vall" it errors. Vall is supposed to be QueryVariables, and filter too.
                this.variablesManager.set('navigation', variables as Vall);
            }
        });

        super.ngOnInit();

        // On each data arriving, we query children count to show/hide chevron
        this.dataSource.internalDataObservable.pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
            if (!data) {
                return;
            }

            data.items.forEach(item => {
                const condition = {};
                condition[this.ancestorRelationName] = {have: {values: [item.id]}};
                const variables: QueryVariables = {filter: {groups: [{conditions: [condition]}]}};

                const qvm = new NaturalQueryVariablesManager<Vall>();
                qvm.set('variables', variables as Partial<Vall>);
                this.service.count(qvm).subscribe(count => Object.assign(item, {hasNavigation: count > 0}));
            });

        });
    }

    protected translateSearchAndRefreshList(naturalSearchSelections: NaturalSearchSelections) {

        // Clear navigation filter if there is a search
        if (naturalSearchSelections.some(s => s.length)) {
            this.variablesManager.set('navigation', null);
        }

        super.translateSearchAndRefreshList(naturalSearchSelections);
    }

    public clearSearch() {
        this.naturalSearchSelections = null;
        this.persistenceService.persistInStorage('ns', null, this.getStorageKey());
    }

    /**
     * Return an array for router link usage
     */
    public getChildLink(ancestor: { id }): RouterLink['routerLink'] {
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
        if (item[this.ancestorRelationName]) {
            return this.getBreadcrumb(item[this.ancestorRelationName]).concat([item]);
        }

        return [item];
    }

}
