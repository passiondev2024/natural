import {Injectable, Injector} from '@angular/core';
import {intersection} from 'lodash-es';
import {BehaviorSubject, first, forkJoin, Observable} from 'rxjs';

import {finalize, map} from 'rxjs/operators';
import {NaturalQueryVariablesManager, QueryVariables} from '../../../classes/query-variable-manager';
import {HierarchicFlatNode} from '../classes/flat-node';
import {
    NaturalHierarchicConfiguration,
    NaturalHierarchicServiceConfiguration,
} from '../classes/hierarchic-configuration';
import {
    HierarchicFilterConfiguration,
    HierarchicFiltersConfiguration,
} from '../classes/hierarchic-filters-configuration';
import {HierarchicModel, HierarchicModelNode} from '../classes/model-node';
import {Literal} from '../../../types/types';
import {FilterGroupCondition} from '../../search/classes/graphql-doctrine.types';

export interface OrganizedModelSelection {
    [key: string]: any[];
}

interface ContextualizedConfig {
    configuration: NaturalHierarchicServiceConfiguration;
    variablesManager: NaturalQueryVariablesManager;
}

@Injectable()
export class NaturalHierarchicSelectorService {
    /**
     * Stores the global result of the tree
     * This observable contains Node.
     * When it's updated, the TreeController and TreeFlattener process the new array to generate the flat tree.
     */
    public readonly dataChange: BehaviorSubject<HierarchicModelNode[]> = new BehaviorSubject<HierarchicModelNode[]>([]);

    /**
     * Configuration for relations and selection constraints
     *
     * The list should be sorted in the order of the hierarchic (list first parent rules, then child rules)
     */
    private configuration: NaturalHierarchicConfiguration[] = [];

    public constructor(private readonly injector: Injector) {}

    /**
     * Init component by saving the complete configuration, and then retrieving root elements.
     * Updates **another** observable (this.dataChange) when data is retrieved.
     */
    public init(
        config: NaturalHierarchicConfiguration[],
        contextFilter: HierarchicFiltersConfiguration | null = null,
        searchVariables: QueryVariables | null = null,
    ): Observable<unknown> {
        this.validateConfiguration(config);
        this.configuration = this.injectServicesInConfiguration(config);
        return this.getList(null, contextFilter, searchVariables).pipe(map(data => this.dataChange.next(data)));
    }

    /**
     * Get list of children, considering given FlatNode id as a parent.
     * Mark loading status individually on nodes.
     */
    public loadChildren(
        flatNode: HierarchicFlatNode,
        contextFilter: HierarchicFiltersConfiguration | null = null,
    ): void {
        // Dont refetch children. Improve performances
        // Prevents interferences between HierarchicModelNode structure and angular components navigation.
        // Prevents a bug where grand children were lost if closing root
        if (flatNode.node.children.length) {
            return;
        }

        flatNode.loading = true;
        this.getList(flatNode, contextFilter)
            .pipe(finalize(() => (flatNode.loading = false)))
            .subscribe(items => {
                flatNode.node.childrenChange.next(items);
                this.dataChange.next(this.dataChange.value);
            });
    }

    public search(searchVariables: QueryVariables, contextFilter: HierarchicFiltersConfiguration | null = null): void {
        this.getList(null, contextFilter, searchVariables).subscribe(items => {
            this.dataChange.next(items);
        });
    }

    /**
     * Retrieve elements from the server
     * Get root elements if node is null, or child elements if node is given
     */
    private getList(
        node: HierarchicFlatNode | null = null,
        contextFilters: HierarchicFiltersConfiguration | null = null,
        searchVariables: QueryVariables | null = null,
    ): Observable<HierarchicModelNode[]> {
        const configurations = this.getContextualizedConfigs(node, contextFilters, searchVariables);
        const observables = configurations.map(c => c.configuration.injectedService.getAll(c.variablesManager));

        // Fire queries, and merge results, transforming apollo items into Node Object.
        return forkJoin(observables).pipe(
            map(results => {
                const listing: HierarchicModelNode[] = [];

                // For each result of an observable
                for (let i = 0; i < results.length; i++) {
                    // For each item of the result, convert into Node object
                    for (const item of results[i].items) {
                        listing.push(this.getOrCreateModelNode(item, configurations[i].configuration));
                    }
                }

                return listing;
            }),
        );
    }

    public countItems(node: HierarchicFlatNode, contextFilters: HierarchicFiltersConfiguration | null = null): void {
        const configurations = this.getContextualizedConfigs(node, contextFilters, null);
        const observables = configurations.map(c =>
            c.configuration.injectedService.count(c.variablesManager).pipe(first()),
        );

        forkJoin(observables).subscribe(results => {
            const totalItems = results.reduce((total, length) => total + length, 0);
            node.expandable = totalItems > 0;
        });
    }

    private getContextualizedConfigs(
        node: HierarchicFlatNode | null = null,
        contextFilters: HierarchicFiltersConfiguration | null = null,
        searchVariables: QueryVariables | null = null,
    ): ContextualizedConfig[] {
        const configsAndServices: ContextualizedConfig[] = [];

        // Considering the whole configuration may cause queries with no/wrong results we have imperatively to avoid !
        // e.g there are cross dependencies between equipments and taxonomies filters. Both have "parents" and "taxonomies" filters...
        // When clicking on a equipment, the configuration of taxonomies with match "parents" filter, but use the id of the equipment
        // To fix this, we should only consider configuration after the one given by the node passed as argument.
        // That would mean : no child can affect parent.
        // That would mean : sorting in the configuration have semantic/hierarchy implications
        const configs = node ? this.getNextConfigs(node.node.config) : this.configuration;

        const pagination = {pageIndex: 0, pageSize: 999};

        for (const config of configs) {
            const item: ContextualizedConfig = {} as ContextualizedConfig;
            const contextFilter = this.getFilterByService(config, contextFilters);
            const filter = this.getServiceFilter(node, config, contextFilter, !!searchVariables);

            if (!filter || !config.injectedService) {
                continue;
            }

            const variablesManager = new NaturalQueryVariablesManager();

            variablesManager.set('variables', {filter: filter, pagination: pagination});
            variablesManager.set('config-filter', {filter: config.filter});

            if (searchVariables) {
                variablesManager.set('natural-search', searchVariables);
            }

            // Cast NaturalHierarchicServiceConfiguration because the undefined
            // injectedServices are filtered earlier and we can validate value
            item.configuration = config as NaturalHierarchicServiceConfiguration;
            item.variablesManager = variablesManager;
            configsAndServices.push(item);
        }

        return configsAndServices;
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
        }, {} as Literal);

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

    private injectServicesInConfiguration(
        configurations: NaturalHierarchicConfiguration[],
    ): NaturalHierarchicConfiguration[] {
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
    private validateConfiguration(configurations: NaturalHierarchicConfiguration[]): void {
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
     * Return configurations setup in the list after the given one
     */
    private getNextConfigs(config: NaturalHierarchicConfiguration): NaturalHierarchicConfiguration[] {
        const configIndex = this.configuration.findIndex(c => c === config);
        return this.configuration.slice(configIndex);
    }

    /**
     * Builds queryVariables filter for children query
     */
    private getServiceFilter(
        flatNode: HierarchicFlatNode | null,
        config: NaturalHierarchicConfiguration,
        contextFilter: HierarchicFilterConfiguration['filter'] | null = null,
        allDeeps = false,
    ): HierarchicFilterConfiguration['filter'] | null {
        const fieldCondition: FilterGroupCondition = {};

        // if no parent, filter empty elements
        if (!flatNode) {
            if (!config.parentsRelationNames) {
                return contextFilter ? contextFilter : {};
            }

            if (!allDeeps) {
                config.parentsRelationNames.forEach(f => {
                    fieldCondition[f] = {empty: {}};
                });
            }
        } else {
            if (!flatNode.node.config.childrenRelationNames || !config.parentsRelationNames) {
                return null;
            }

            const matchingFilters = intersection(
                flatNode.node.config.childrenRelationNames,
                config.parentsRelationNames,
            );
            if (!matchingFilters.length) {
                return null;
            }
            fieldCondition[matchingFilters[0]] = {have: {values: [flatNode.node.model.id]}};
        }

        const filters = {groups: [{conditions: [fieldCondition]}]};

        // todo : is it right ? shouldn't it be managed with QueryVariablesManager's channels ? ?
        if (contextFilter) {
            filters.groups.push(...contextFilter.groups);
        }

        return filters;
    }

    /**
     * Return a context filter applicable to the service for given config
     *
     * @param config Applicable config
     * @param contextFilters List of context filters
     */
    private getFilterByService(
        config: NaturalHierarchicConfiguration,
        contextFilters: HierarchicFilterConfiguration[] | null,
    ): HierarchicFilterConfiguration['filter'] | null {
        if (!contextFilters || !config) {
            return null;
        }

        const filter = contextFilters.find(f => f.service === config.service);
        return filter ? filter.filter : null;
    }

    /**
     * Search in configurations.selectableAtKey attribute to find given key and return the configuration
     */
    private getConfigurationBySelectableKey(
        key: NaturalHierarchicConfiguration['selectableAtKey'],
    ): NaturalHierarchicConfiguration | null {
        if (!this.configuration) {
            return null;
        }

        return this.configuration.find(conf => conf.selectableAtKey === key) || null;
    }

    private getOrCreateModelNode(
        item: HierarchicModel,
        configuration: NaturalHierarchicConfiguration,
    ): HierarchicModelNode {
        const node = this.dataChange.value.find(n => n.model.id === item.id && n.model.__typename === item.__typename);
        return node || new HierarchicModelNode(item, configuration);
    }
}
