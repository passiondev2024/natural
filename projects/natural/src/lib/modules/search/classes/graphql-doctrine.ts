import {Facet, FlagFacet, NaturalSearchFacets} from '../types/facet';
import {NaturalSearchSelection, NaturalSearchSelections} from '../types/values';
import {
    Filter,
    FilterGroup,
    FilterGroupCondition,
    FilterGroupConditionField,
    JoinOn,
    LogicalOperator,
} from './graphql-doctrine.types';
import {deepClone, getFacetFromSelection} from './utils';

export function toGraphQLDoctrineFilter(
    facets: NaturalSearchFacets | null,
    selections: NaturalSearchSelections | null,
): Filter {
    selections = deepClone(selections);

    const filter: Filter = {};
    if (!selections || selections.length === 0) {
        selections = [[]];
    }

    for (const groupSelections of selections) {
        const group: FilterGroup = {};
        const neededInversedFlags = facets ? facets.filter(isInvertedFlag) : [];

        for (const selection of groupSelections) {
            const facet = getFacetFromSelection(facets, selection);
            const transformedSelection = transformSelection(facet, selection);

            // Skip inverted flag and remove it from needed inverted flags
            if (facet && isInvertedFlag(facet)) {
                neededInversedFlags.splice(neededInversedFlags.indexOf(facet), 1);
            } else {
                applyJoinAndCondition(group, transformedSelection);
            }
        }

        for (const facet of neededInversedFlags) {
            const transformedSelection = transformSelection(facet, {
                field: facet.field,
                name: facet.name,
                condition: deepClone((facet as FlagFacet).condition),
            });
            applyJoinAndCondition(group, transformedSelection);
        }

        addGroupToFilter(filter, group);
    }

    return filter;
}

function applyJoinAndCondition(group: FilterGroup, selection: NaturalSearchSelection): void {
    // Apply join, then apply operator on that join, if field name has a '.'
    const [joinedRelation, joinedField] = selection.field.split('.');
    let container;
    let wrappedCondition;
    if (joinedField) {
        container = addJoinToGroup(group, joinedRelation);
        wrappedCondition = wrapWithFieldName(joinedField, selection.condition);
    } else {
        container = group;
        wrappedCondition = wrapWithFieldName(selection.field, selection.condition);
    }

    addConditionToContainer(container, wrappedCondition);
}

/**
 * Only add join if it does not already exists
 */
function addJoinToGroup(group: FilterGroup, joinedRelation: string): JoinOn {
    if (!group.joins) {
        group.joins = {};
    }

    if (!group.joins[joinedRelation]) {
        group.joins[joinedRelation] = {};
    }

    return group.joins[joinedRelation];
}

/**
 * Only add condition to group or join if it's valid
 */
function addConditionToContainer(container: FilterGroup | JoinOn, condition: FilterGroupCondition): void {
    if (!condition) {
        return;
    }

    if (!container.conditions) {
        container.conditions = [];
    }

    container.conditions.push(condition);
}

/**
 * Only add the group if there is something meaningful
 */
function addGroupToFilter(filter: Filter, group: FilterGroup): void {
    if (group.conditions || group.joins) {
        if (!filter.groups) {
            filter.groups = [];
        }

        filter.groups.push(group);

        if (filter.groups.length > 1) {
            group.groupLogic = LogicalOperator.OR;
        }
    }
}

function wrapWithFieldName(field: string, condition: FilterGroupConditionField): FilterGroupCondition {
    const result: FilterGroupCondition = {};

    // We assume a custom operator "search"
    if (field === 'search' && condition.like) {
        return {custom: {search: {value: condition.like.value}}} as FilterGroupCondition;
    } else {
        result[field] = condition;
    }

    return result;
}

function transformSelection(facet: Facet | null, selection: NaturalSearchSelection): NaturalSearchSelection {
    return facet && facet.transform ? facet.transform(selection) : selection;
}

function isInvertedFlag(f: Facet): boolean {
    return ('inversed' in f && f.inversed) || false;
}
