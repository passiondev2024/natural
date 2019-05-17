import { Type } from '@angular/core';
import { DropdownComponent } from './DropdownComponent';
import { Selection } from './Values';

// todo : rename BasicFacetConfiguration ?
interface BasicConfiguration {
    /**
     * The label to be used in the GUI
     */
    display: string;

    /**
     * The field this item should apply to.
     *
     * In most cases it should be the property name of the model. Something like:
     *
     * - name
     * - description
     * - artist.name
     */
    field: string;

    /**
     * Alias used as identifier for configuration in case many configs use the same field name
     * Issue #16
     */
    name?: string;

    /**
     * A function to transform the selection before it is applied onto the filter.
     *
     * This would typically be useful to do unit conversion so the GUI has some user
     * friendly values, but the API works with a "low-level" unit.
     */
    transform?: (Selection) => Selection;
}

/**
 * Configuration for an item that is only a flag (set or unset)
 * todo : rename FlagFacetConfiguration ?
 */
export interface FlagConfiguration extends BasicConfiguration {

    /**
     * The value to be returned when the flag is set
     */
    condition: any;
}

/**
 * Configuration for an item that uses a component in a dropdown
 * todo : rename DropdownFacetConfiguration ?
 */
export interface DropdownConfiguration<config> extends BasicConfiguration {
    component: Type<DropdownComponent>;

    /**
     * Show a button into the dropdown container to validate value. Gives alternative to "click out" and incoming "tab/esc" key.
     */
    showValidateButton?: boolean;

    /**
     * Anything that could be useful for the dropdown component
     */
    configuration?: config;
}

// todo : rename FacetConfiguration ?
export type ItemConfiguration =
    DropdownConfiguration<any>
    | FlagConfiguration;

/**
 * Exhaustive list of configurations
 */
export interface NaturalSearchConfiguration extends Array<ItemConfiguration> {
}
