import { isString } from 'lodash';
import { NaturalSearchFacets } from '../types/Facet';
import { NaturalSearchSelections, Selection } from '../types/Values';
import {
    Filter,
    FilterGroup,
    FilterGroupConditionField,
    FilterGroupCondition,
    LogicalOperator,
    JoinOn,
} from './graphql-doctrine.types';
import { getFacetFromSelection } from './utils';
import { deepClone } from './utils';

export function toGraphQLDoctrineFilter(
    facets: NaturalSearchFacets | null,
    selections: NaturalSearchSelections | null,
): Filter {
    selections = deepClone(selections);

    const filter: Filter = {};
    if (!selections) {
        return filter;
    }

    for (const groupSelections of selections) {
        const group: FilterGroup = {};

        for (const selection of groupSelections) {
            const transformedSelection = transformSelection(facets, selection);
            const field = transformedSelection.field;
            const value = transformedSelection.condition;
            applyJoinAndCondition(group, field, value);
        }

        addGroupToFilter(filter, group);
    }

    return filter;
}

function applyJoinAndCondition(group: FilterGroup, field: string, condition: FilterGroupConditionField): void {
    // Apply join, then apply operator on that join, if field name has a '.'
    const [joinedRelation, joinedField] = field.split('.');
    let container;
    let wrappedCondition;
    if (joinedField) {
        container = addJoinToGroup(group, joinedRelation);
        wrappedCondition = wrapWithFieldName(joinedField, condition);
    } else {
        container = group;
        wrappedCondition = wrapWithFieldName(field, condition);
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

function transformSelection(facets: NaturalSearchFacets | null, selection: Selection): Selection {
    const facet = getFacetFromSelection(facets, selection);

    return facet && facet.transform ? facet.transform(selection) : selection;
}
