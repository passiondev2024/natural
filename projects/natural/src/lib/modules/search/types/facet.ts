import {Type} from '@angular/core';
import {DropdownComponent} from './dropdown-component';
import {NaturalSearchSelection} from './values';

interface BasicFacet {
    /**
     * The label to be used in the GUI
     */
    display: string;

    /**
     * The field this facet should apply to.
     *
     * In most cases it should be the property name of the model. Something like:
     *
     * - name
     * - description
     * - artist.name
     */
    field: string;

    /**
     * This is required only if there are duplicated `field` in all facets.
     *
     * If `name` exists it will be used as an alternative identifier for facet, instead of `field`, to match
     * a selection with its facet (in `getFacetFromSelection()`). So a selection must be given with the `name`,
     * instead of `field`. And it will also be present in the URL. But it will never appear in the GraphQL selection.
     *
     * https://github.com/Ecodev/natural-search/issues/16
     */
    name?: string;

    /**
     * A function to transform the selection before it is applied onto the filter.
     *
     * This would typically be useful to do unit conversion so the GUI has some user
     * friendly values, but the API works with a "low-level" unit.
     */
    transform?: (s: NaturalSearchSelection) => NaturalSearchSelection;
}

/**
 * Facet that is only a flag (set or unset)
 */
export interface FlagFacet<Condition> extends BasicFacet {
    /**
     * The value to be returned when the flag is set
     */
    condition: Condition;

    /**
     * If true the value is set when the flag does NOT exist and the
     * value is unset when the flag exists.
     *
     * Defaults to `false`.
     */
    inversed?: boolean;
}

/**
 * Facet that uses a component in a dropdown
 */
export interface DropdownFacet<C> extends BasicFacet {
    component: Type<DropdownComponent>;

    /**
     * Show a button into the dropdown container to validate value. Gives alternative to "click out" and incoming "tab/esc" key.
     */
    showValidateButton?: boolean;

    /**
     * Anything that could be useful for the dropdown component
     */
    configuration?: C;
}

/**
 * A facet
 */
export type Facet = DropdownFacet<any> | FlagFacet<any>;

/**
 * Exhaustive list of facets
 */
export type NaturalSearchFacets = Array<Facet>;
