import { Injector, Input, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NaturalAbstractModelService } from '../services/abstract-model.service';
import { NaturalAbstractList } from './abstract-list';
import { PaginatedData } from './data-source';
import { QueryVariables } from './query-variable-manager';

/**
 * This class helps managing a list of paginated items that can be filtered,
 * selected, and then bulk actions can be performed on selection.
 */
export class NaturalAbstractNavigableList<Tall extends PaginatedData<any>, Vall extends QueryVariables>
    extends NaturalAbstractList<Tall, Vall> implements OnInit, OnDestroy {

    /**
     * Name of filter for child items to access ancestor item
     */
    @Input() ancestorRelationName = 'parent';

    public breadcrumbs: any[] = [];

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
                    this.service.getOne(params['na']).subscribe(ancestor => this.breadcrumbs = this.getBreadcrumb(ancestor));
                    this.clearSearch();

                } else {
                    navigationConditionValue = {empty: {}};
                    this.breadcrumbs = [];
                }

                const condition = {};
                condition[this.ancestorRelationName] = navigationConditionValue;
                const filter: QueryVariables = {filter: {groups: [{conditions: [condition]}]}};

                // todo : check why without "as Vall" it errors. Vall is supposed to be QueryVariables, and filter too.
                this.variablesManager.set('navigation', filter as Vall);
            }
        });

        super.ngOnInit();
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
     * Deep is limited by queries
     * @param item with an ancestor relation (must match ancestorRelationName attribute)
     */
    protected getBreadcrumb(item): { name }[] {
        if (item[this.ancestorRelationName]) {
            return this.getBreadcrumb(item[this.ancestorRelationName]).concat([item]);
        }

        return [item];
    }

}
