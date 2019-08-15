import { Injector, OnDestroy, OnInit } from '@angular/core';
import { toGraphQLDoctrineFilter } from '../modules/search/classes/graphql-doctrine';
import { NaturalSearchSelections } from '../modules/search/types/values';
import { NaturalAbstractModelService } from '../services/abstract-model.service';
import { NaturalAbstractList } from './abstract-list';
import { QueryVariables } from './query-variable-manager';

/**
 * This class helps managing a list of paginated items that can be filtered,
 * selected, and then bulk actions can be performed on selection.
 */
export class NaturalAbstractNavigableList<Tall, Vall extends QueryVariables> extends NaturalAbstractList<Tall, Vall>
    implements OnInit, OnDestroy {

    public breadcrumbs: any[] = [];

    constructor(service: NaturalAbstractModelService<any, any, any, any, any, any, any, any, any>,
                injector: Injector,
    ) {

        super(service, injector);
    }

    ngOnInit(): void {

        this.route.params.subscribe((params: any) => {

            // "ns" stands for natural-search to be shorter in url
            if (!params['ns']) {

                let parentCondition: any | null = null;
                if (params.parent) {

                    // parentCondition = {equal: {value: params.parent}}; // todo : remove if everything ok with bellow version
                    parentCondition = {have: {values: [params.parent]}};
                    this.service.getOne(params.parent).subscribe(parent => {
                        this.breadcrumbs = this.getBreadcrumb(parent);
                    });

                    this.clearSearch();

                } else {
                    // parentCondition = {null: {}}; // todo : remove if everything ok with bellow version
                    parentCondition = {empty: {}};
                    this.breadcrumbs = [];
                }

                const filter: QueryVariables = {filter: {groups: [{conditions: [{parent: parentCondition}]}]}};

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

    public goToChildLink(parent) {
        if (parent && parent.id) {
            return ['.', {parent: parent.id}];
        } else {
            return ['.', {}];
        }
    }

    protected translateSearchAndRefreshList(naturalSearchSelections: NaturalSearchSelections) {

        if (NaturalAbstractList.hasSelections(naturalSearchSelections)) {
            this.variablesManager.set('navigation', null);

        } else {

            // If there is no search, restore only root elements
            this.variablesManager.set('navigation', {
                filter: {groups: [{conditions: [{parent: {empty: {}}}]}]},
            } as Vall);
            // todo : check why without "as Vall" it errors. Vall is supposed to be QueryVariables, and filter too.
        }

        const translatedSelection = toGraphQLDoctrineFilter(this.naturalSearchFacets, naturalSearchSelections);

        // todo : check why without "as Vall" it errors.  Vall is supposed to be QueryVariables, and filter too.
        this.variablesManager.set('natural-search', {filter: translatedSelection} as Vall);
    }

    /**
     * Deep is limited by queries
     * @param item with a parenting relation
     */
    protected getBreadcrumb(item: { parent, name }): { name }[] {
        if (item.parent) {
            return this.getBreadcrumb(item.parent).concat([item]);
        }

        return [item];
    }

}
