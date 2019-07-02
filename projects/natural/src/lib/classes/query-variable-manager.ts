import { cloneDeep, defaultsDeep, groupBy, isArray, mergeWith, omit, uniq } from 'lodash';
import { BehaviorSubject } from 'rxjs';
import { LogicalOperator } from '../modules/search/classes/graphql-doctrine.types';
import { Literal } from '../types/types';

export interface QueryVariables {
    filter?: any | null;
    pagination?: PaginationInput | null;
    sorting?: Array<Sorting> | null;
}

export interface PaginationInput {
    offset?: number | null;
    pageIndex?: number | null;
    pageSize?: number | null;
}

export interface Sorting {
    field: string;
    order?: SortingOrder | null;
}

export enum SortingOrder {
    ASC = 'ASC',
    DESC = 'DESC',
}

/**
 * During lodash merge, overrides arrays
 */
function mergeOverrideArray(destValue, source) {
    if (isArray(source)) {
        return source;
    }
}

/**
 * During lodash merge, concat arrays
 */
function mergeConcatArray(destValue, source) {
    if (isArray(source)) {
        if (destValue) {
            return destValue.concat(source);
        } else {
            return source;
        }
    }
}

/**
 * Filter manager stores a set of channels that contain a variable object and exposes an observable "variables" that updates with the result
 * of all channels merged together.
 *
 * A channel is supposed to be used by an aspect of the GUI (pagination, sorting, search, others ?).
 * Each
 *
 * const fm = new QueryVariablesManager();
 * fm.merge('componentA-variables', {a : [1, 2, 3]});
 *
 * Variables attributes is a BehaviorSubject. That mean it's not mandatory to subscribe, we can just call getValue or value attributes on
 * it : console.log(fm.variables.value); //  {a : [1, 2, 3]}
 *
 * Set new variables for 'componentA-variables'
 * fm.merge('componentA-variables', {a : [1, 2]);
 * console.log(fm.variables.value); //  {a : [1, 2, 3]}
 *
 * Set new variables for new channel
 * fm.merge('componentB-variables', {a : [3, 4]);
 * console.log(fm.variables.value); // {a : [1, 2, 3, 4]}
 */
export class NaturalQueryVariablesManager<T extends QueryVariables = QueryVariables> {

    public readonly variables: BehaviorSubject<T | undefined> = new BehaviorSubject<T | undefined>(undefined);
    private readonly channels: Map<string, T> = new Map<string, T>();

    public static hasMixedGroupLogic(groups: Literal[]): boolean {

        // Complete lack of definition by fallback on AND operator
        const completedGroups = cloneDeep(groups).map(group => {

            if (!group.groupLogic) {
                group.groupLogic = LogicalOperator.AND;
            }

            return group;
        });

        const groupLogics = uniq(Object.keys(groupBy(completedGroups.slice(1), 'groupLogic')));

        console.log('groupLogics', groupLogics);

        return groupLogics.length > 1;
    }

    constructor(queryVariablesManager?: NaturalQueryVariablesManager<T>) {

        if (queryVariablesManager) {
            this.channels = queryVariablesManager.getChannelsCopy();
            this.updateVariables();
        }
    }

    /**
     * Set or override all the variables that may exist in the given channel
     */
    public set(channelName: string, variables: T | null) {
        // cloneDeep to change reference and prevent some interactions when merge
        if (variables !== null) {
            this.channels.set(channelName, cloneDeep(variables));
        } else {
            this.channels.delete(channelName);
        }
        this.updateVariables();
    }

    public get(channelName: string) {
        // Avoid to return the same reference to prevent an attribute change, then another channel update that would used this changed
        // attribute without having explicitly asked QueryVariablesManager to update it.
        return cloneDeep(this.channels.get(channelName));
    }

    /**
     * Merge variable into a channel, overriding arrays in same channel / key
     */
    public merge(channelName: string, newVariables: T) {
        const variables = this.channels.get(channelName);
        if (variables) {
            mergeWith(variables, cloneDeep(newVariables), mergeOverrideArray); // merge preserves references, cloneDeep prevent that
            this.updateVariables();
        } else {
            this.set(channelName, newVariables);
        }
    }

    /**
     * Apply default values to a channel
     * Note : lodash defaults only defines values on destinations keys that are undefined
     */
    public defaults(channelName: string, newVariables: T) {
        const variables = this.channels.get(channelName);
        if (variables) {
            defaultsDeep(variables, newVariables);
            this.updateVariables();
        } else {
            this.set(channelName, newVariables);
        }
    }

    public getChannelsCopy(): Map<string, T> {
        return new Map<string, T>(this.channels);
    }

    /**
     * Merge channels in a single object
     * Arrays are concatenated
     * Filter groups are combined smartly (see mergeGroupList)
     */
    private updateVariables() {

        const merged: Literal = {};

        this.channels.forEach((channelVariables: Literal) => {

            if (channelVariables.filter) {

                // Merge filter's groups first
                const groups = this.mergeGroupList(merged.filter ? merged.filter.groups : [], channelVariables.filter.groups);

                if (groups && groups.length) {
                    if (merged.filter) {
                        merged.filter.groups = groups;
                    } else {
                        merged.filter = {groups: groups};
                    }
                }
            }

            mergeWith(merged, omit(channelVariables, 'filter'), mergeConcatArray); // merge other attributes but filter
        });

        this.variables.next(merged as T);
    }

    /**
     * Cross merge two filters
     * Only accepts groups with same groupLogic (ignores the first one, because there is no groupLogic in this one)
     * @throws In case two non-empty lists of groups are given and at one of them mix groupLogic value, throws an error
     */
    private mergeGroupList(groupsA: Literal[], groupsB: Literal[]): Literal {

        if (groupsA.length === 0 && groupsB.length === 0) {
            return []; // empty listings, return empty lists
        }

        if (groupsA.length === 0 && groupsB.length > 0) {
            return groupsB; // One list is empty, return the one that is not
        }

        if (groupsB.length === 0 && groupsA.length > 0) {
            return groupsA; // One list is empty, return the one that is not
        }

        const groups: Literal[] = [];

        if (NaturalQueryVariablesManager.hasMixedGroupLogic(groupsA) || NaturalQueryVariablesManager.hasMixedGroupLogic(groupsB)) {
            throw Error('QueryVariables groups contain mixed group logics');
        }

        groupsA.forEach(groupA => {
            groupsB.forEach((groupB) => {
                groups.push(mergeWith(cloneDeep(groupA), groupB, mergeConcatArray));
            });
        });

        return groups;
    }
}
