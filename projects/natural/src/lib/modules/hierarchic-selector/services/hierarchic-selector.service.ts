import { Injectable, Injector } from '@angular/core';
import { intersection } from 'lodash';
import { BehaviorSubject, forkJoin, Observable } from 'rxjs';

import { map } from 'rxjs/operators';
import { NaturalQueryVariablesManager, QueryVariables } from '../../../classes/query-variable-manager';
import { HierarchicFlatNode } from '../classes/flat-node';
import { NaturalHierarchicConfiguration } from '../classes/hierarchic-configuration';
import { HierarchicFilterConfiguration, HierarchicFiltersConfiguration } from '../classes/hierarchic-filters-configuration';
import { HierarchicModelNode } from '../classes/model-node';

export interface OrganizedModelSelection {
    [key: string]: any[];
}

@Injectable()
export class NaturalHierarchicSelectorService {

    /**
     * Stores the global result of the tree
     * This observable contains Node.
     * When it's updated, the TreeController and TreeFlattener process the new array to generate the flat tree.
     */
    dataChange: BehaviorSubject<HierarchicModelNode[]> = new BehaviorSubject<HierarchicModelNode[]>([]);

    /**
     * Configuration for relations and selection constraints
     */
    private configuration: NaturalHierarchicConfiguration[];

    constructor(private injector: Injector) {
    }

    /**
     * Init component by saving the complete configuration, and then retrieving root elements.
     * Updates **another** observable (this.dataChange) when data is retrieved.
     */
    public init(config: NaturalHierarchicConfiguration[], contextFilter: HierarchicFiltersConfiguration | null = null): Observable<any> {

        this.validateConfiguration(config);
        this.configuration = this.injectServicesInConfiguration(config);

        return this.getList(null, contextFilter).pipe(map((data: any) => {
            this.dataChange.next(data);
            return data;
        }));
    }

    /**
     * Get list of children, considering given FlatNode id as a parent.
     * Mark loading status individually on nodes.
     */
    public loadChildren(flatNode: HierarchicFlatNode, contextFilter: HierarchicFiltersConfiguration | null = null) {
        flatNode.loading = true;
        this.getList(flatNode, contextFilter).subscribe(items => {
            flatNode.node.childrenChange.next(items);
            this.dataChange.next(this.dataChange.value);
            flatNode.loading = false;
        });
    }

    public search(searchVariables: QueryVariables, contextFilter: HierarchicFiltersConfiguration | null = null) {
        return this.getList(null, contextFilter, searchVariables).subscribe(items => {
            this.dataChange.next(items);
        });
    }

    /**
     * Retrieve elements from the server
     * Get root elements if node is null, or child elements if node is given
     */
    public getList(node: HierarchicFlatNode | null = null,
                   contextFilters: HierarchicFiltersConfiguration | null = null,
                   searchVariables: QueryVariables | null = null): Observable<any> {

        const configurations: NaturalHierarchicConfiguration[] = [];
        const observables: Observable<any>[] = [];

        // Considering the whole configuration may cause queries with no/wrong results we have imperatively to avoid !
        // e.g there are cross dependencies between equipments and taxonomies filters. Both have "parents" and "taxonomies" filters...
        // When clicking on a equipment, the configuration of taxonomies with match "parents" filter, but use the id of the equipment
        // To fix this, we should only consider configuration after the one given by the node passed as argument.
        // That would mean : no child can affect parent.
        // That would mean : sorting in the configuration have semantic/hierarchy implications
        const configs = node ? this.getNextConfigs(node.node.config) : this.configuration;

        const pagination = {
            pageIndex: 0,
            pageSize: 999,
        };

        for (const config of configs) {
            const contextFilter = this.getServiceContextFilter(config, contextFilters);
            const filter = this.getServiceFilter(node, config, contextFilter, !!searchVariables);
            if (filter && config.injectedService) {
                configurations.push(config);
                const variablesManager = new NaturalQueryVariablesManager();

                variablesManager.set('variables', {
                    filter: filter,
                    pagination: pagination,
                });

                variablesManager.set('config-filter', {
                    filter: config.filter,
                });

                if (searchVariables) {
                    variablesManager.set('natural-search', searchVariables);
                }

                observables.push(config.injectedService.getAll(variablesManager));
            }
        }

        // Fire queries, and merge results, transforming apollo items into Node Object.
        return forkJoin(observables).pipe(map((results: any) => {
            const listing: HierarchicModelNode[] = [];

            const totalItems = results.reduce((stack, val) => stack + val.items.length, 0);
            if (totalItems === 0 && node) {
                node.expandable = false;
            }

            // For each result of an observable
            for (let i = 0; i < results.length; i++) {

                // For each item of the result, convert into Node object
                for (const item of results[i].items) {
                    listing.push(new HierarchicModelNode(item, configurations[i]));
                }
            }

            return listing;
        }));
    }

    /**
     * Check configuration to return a boolean that allows or denies the selection for the given element
     */
    public isSelectable(node: HierarchicFlatNode): boolean {
        return !!node.node.config.selectableAtKey;
    }

    /**
     * Return models matching given FlatNodes
     * Returns a Literal of models grouped by their configuration attribute "selectableAtKey"
     */
    public toOrganizedSelection(nodes: HierarchicModelNode[]): OrganizedModelSelection {

        const selection = this.configuration.reduce((group, config) => {
            if (config.selectableAtKey) {
                group[config.selectableAtKey] = [];
            }
            return group;
        }, {});

        for (const node of nodes) {
            if (node.config.selectableAtKey) {
                selection[node.config.selectableAtKey].push(node.model);
            }
        }

        return selection;
    }

    /**
     * Transforms an OrganizedModelSelection into a list of ModelNodes
     */
    public fromOrganizedSelection(organizedModelSelection: OrganizedModelSelection): HierarchicModelNode[] {

        if (!organizedModelSelection) {
            return [];
        }

        const result: HierarchicModelNode[] = [];
        for (const selectableAtKey of Object.keys(organizedModelSelection)) {
            const config = this.getConfigurationBySelectableKey(selectableAtKey);
            if (config) {
                for (const model of organizedModelSelection[selectableAtKey]) {
                    result.push(new HierarchicModelNode(model, config));
                }
            }
        }
        return result;
    }

    private injectServicesInConfiguration(configurations: NaturalHierarchicConfiguration[]): NaturalHierarchicConfiguration[] {

        for (const config of configurations) {
            if (!config.injectedService) {
                config.injectedService = this.injector.get(config.service);
            }
        }

        return configurations;
    }

    /**
     * Checks that each configuration.selectableAtKey attribute is unique
     */
    private validateConfiguration(configurations: NaturalHierarchicConfiguration[]) {
        const selectableAtKeyAttributes: string[] = [];
        for (const config of configurations) {

            if (config.selectableAtKey) {
                const keyIndex = selectableAtKeyAttributes.indexOf(config.selectableAtKey);

                if (keyIndex === -1 && config.selectableAtKey) {
                    selectableAtKeyAttributes.push(config.selectableAtKey);
                }

                // TODO : remove ?
                // This behavior maybe dangerous in case we re-open hierarchical selector with the last returned config having non-unique
                // keys
                if (keyIndex < -1) {
                    console.warn('Invalid hierarchic configuration : selectableAtKey attribute should be unique');
                }
            }

        }
    }

    /**
     * Return a list of configuration from the given one until the end of configurations list
     */
    private getNextConfigs(config) {
        const configIndex = this.configuration.findIndex(c => c === config);
        return this.configuration.slice(configIndex);
    }

    /**
     * Builds queryVariables filter for children query
     */
    private getServiceFilter(flatNode: HierarchicFlatNode | null,
                             config: NaturalHierarchicConfiguration,
                             contextFilter: HierarchicFilterConfiguration['filter'] | null = null,
                             allDeeps = false,
    ): HierarchicFilterConfiguration['filter'] | null {

        const fieldCondition = {};

        // if no parent, filter empty elements
        if (!flatNode) {

            if (!config.parentsFilters) {
                return contextFilter ? contextFilter : {};
            }

            if (!allDeeps) {
                config.parentsFilters.forEach(f => {
                    fieldCondition[f] = {empty: {}};
                });
            }

        } else {

            if (!flatNode.node.config.childrenFilters || !config.parentsFilters) {
                return null;
            }

            const matchingFilters = intersection(flatNode.node.config.childrenFilters, config.parentsFilters);
            if (!matchingFilters.length) {
                return null;
            }
            fieldCondition[matchingFilters[0]] = {have: {values: [flatNode.node.model.id]}};
        }

        const filters = {
            groups: [
                {
                    conditions: [fieldCondition],
                },
            ],
        };

        if (contextFilter) {
            filters.groups.push(...contextFilter.groups);
        }

        return filters;
    }

    private getServiceContextFilter(config: NaturalHierarchicConfiguration,
                                    contextFilters: HierarchicFilterConfiguration[] | null,
    ): HierarchicFilterConfiguration['filter'] | null {

        if (!contextFilters || !config) {
            return null;
        }

        const filter = contextFilters.find((f) => f.service === config.service);
        return filter ? filter.filter : null;
    }

    /**
     * Search in configurations.selectableAtKey attribute to find given key and return the configuration
     */
    private getConfigurationBySelectableKey(key: NaturalHierarchicConfiguration['selectableAtKey']): NaturalHierarchicConfiguration | null {

        if (!this.configuration) {
            return null;
        }

        return this.configuration.find(conf => conf.selectableAtKey === key) || null;
    }

}
