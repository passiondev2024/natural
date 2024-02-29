import {FilterGroupConditionField} from '../classes/graphql-doctrine.types';
import {Facet} from './facet';

/**
 * Type for a search selection
 */
export type NaturalSearchSelection = {
    field: string;

    /**
     * This is required if the facet also have a `name`.
     *
     * See BasicFacet.name
     */
    name?: string;
    condition: FilterGroupConditionField;
};

/**
 * Groups are a list of values, that should be interpreted with AND condition
 */
export type GroupSelections = NaturalSearchSelection[];

/**
 * List of groups, that should be interpreted with OR condition
 * Final input / output format
 */
export type NaturalSearchSelections = GroupSelections[];

/**
 * Consolidated type for a selection and it's matching facet
 * Used internally for dropdown
 */
export type DropdownResult = {
    condition: FilterGroupConditionField;
    facet?: Facet;
};
