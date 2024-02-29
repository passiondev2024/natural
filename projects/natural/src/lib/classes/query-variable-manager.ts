import {cloneDeep, defaultsDeep, isArray, mergeWith, omit} from 'lodash-es';
import {BehaviorSubject} from 'rxjs';
import {Literal} from '../types/types';
import {mergeOverrideArray} from './utility';
import {hasMixedGroupLogic} from './query-variable-manager-utils';

export type QueryVariables = {
    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
    filter?: any | null;
    pagination?: PaginationInput | null;
    sorting?: Sorting[] | null;
};

export type PaginationInput = {
    offset?: number | null;
    pageIndex?: number | null;
    pageSize?: number | null;
};

export type Sorting = {
    field: any;
    order?: SortingOrder | null;
    nullAsHighest?: boolean | null;
    emptyStringAsHighest?: boolean | null;
};

export enum SortingOrder {
    ASC = 'ASC',
    DESC = 'DESC',
}

/**
 * During lodash merge, concat arrays
 */
function mergeConcatArray(destValue: any, source: any): any {
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
 * A channel is supposed to be used by a given aspect of the GUI (pagination, sorting, search, others ?).
 *
 * ```ts
 * const fm = new QueryVariablesManager();
 * fm.merge('componentA-variables', {a : [1, 2, 3]});
 * ```
 *
 * Variables attributes is a BehaviorSubject. That mean it's not mandatory to subscribe, we can just call getValue or value attributes on
 * it :
 *
 * ```ts
 * console.log(fm.variables.value); // {a : [1, 2, 3]}
 * ```
 *
 * Set new variables for 'componentA-variables':
 *
 * ```ts
 * fm.merge('componentA-variables', {a : [1, 2]});
 * console.log(fm.variables.value); // {a : [1, 2, 3]}
 * ```
 *
 * Set new variables for new channel:
 *
 * ```ts
 * fm.merge('componentB-variables', {a : [3, 4]});
 * console.log(fm.variables.value); // {a : [1, 2, 3, 4]}
 * ```
 */
export class NaturalQueryVariablesManager<T extends QueryVariables = QueryVariables> {
    public readonly variables: BehaviorSubject<T | undefined> = new BehaviorSubject<T | undefined>(undefined);
    private readonly channels: Map<string, Partial<T>> = new Map<string, Partial<T>>();

    public constructor(queryVariablesManager?: NaturalQueryVariablesManager<T>) {
        if (queryVariablesManager) {
            this.channels = queryVariablesManager.getChannelsCopy();
            this.updateVariables();
        }
    }

    /**
     * Set or override all the variables that may exist in the given channel
     */
    public set(channelName: string, variables: Partial<T> | null | undefined): void {
        // cloneDeep to change reference and prevent some interactions when merge
        if (variables) {
            this.channels.set(channelName, cloneDeep(variables));
        } else {
            this.channels.delete(channelName);
        }
        this.updateVariables();
    }

    /**
     * Return a deep clone of the variables for the given channel name.
     *
     * Avoid returning the same reference to prevent an attribute change, then another channel update that would
     * used this changed attribute without having explicitly asked QueryVariablesManager to update it.
     */
    public get(channelName: string): Partial<T> | undefined {
        return cloneDeep(this.channels.get(channelName));
    }

    /**
     * Merge variable into a channel, overriding arrays in same channel / key
     */
    public merge(channelName: string, newVariables: Partial<T>): void {
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
    public defaults(channelName: string, newVariables: Partial<T>): void {
        const variables = this.channels.get(channelName);
        if (variables) {
            defaultsDeep(variables, newVariables);
            this.updateVariables();
        } else {
            this.set(channelName, newVariables);
        }
    }

    private getChannelsCopy(): Map<string, Partial<T>> {
        return new Map<string, Partial<T>>(this.channels);
    }

    /**
     * Merge channels in a single object
     * Arrays are concatenated
     * Filter groups are combined smartly (see mergeGroupList)
     */
    private updateVariables(): void {
        const merged: T = {} as T;

        this.channels.forEach(channelVariables => {
            if (channelVariables.filter) {
                // Merge filter's groups first
                const groups = this.mergeGroupList(
                    merged.filter?.groups ? merged.filter.groups : [],
                    channelVariables.filter.groups || [],
                );

                // Merge filter key (that contain groups)
                if (groups?.length) {
                    if (merged.filter) {
                        merged.filter.groups = groups;
                    } else {
                        merged.filter = {groups: groups};
                    }
                } else {
                    mergeWith(merged, {filter: channelVariables.filter}, mergeConcatArray);
                }
            }

            // Merge other attributes than filter
            mergeWith(merged, omit(channelVariables, 'filter'), mergeConcatArray);
        });

        this.variables.next(merged);
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

        if (hasMixedGroupLogic(groupsA) || hasMixedGroupLogic(groupsB)) {
            throw Error('QueryVariables groups contain mixed group logics');
        }

        groupsA.forEach(groupA => {
            groupsB.forEach(groupB => {
                groups.push(mergeWith(cloneDeep(groupA), groupB, mergeConcatArray));
            });
        });

        return groups;
    }
}
