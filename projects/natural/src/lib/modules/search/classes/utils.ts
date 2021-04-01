import {Facet, NaturalSearchFacets} from '../types/facet';
import {NaturalSearchSelection} from '../types/values';

/**
 * Lookup a facet by its `name` and then by its `field`, or return null if not found
 */
export function getFacetFromSelection(
    facets: NaturalSearchFacets | null,
    selection: NaturalSearchSelection,
): Facet | null {
    if (!facets) {
        return null;
    }

    return (
        facets.find(facet => facet.name != null && facet.name === selection.name) ||
        facets.find(facet => facet.field === selection.field) ||
        null
    );
}

/**
 * Deep clone a literal via JSON serializing/unserializing
 *
 * It will **not** work with:
 *
 *     - functions (will be removed)
 *     - `undefined` (will be removed)
 *     - cyclic references (will crash)
 *     - objects (will be converted to `{}`)
 */
export function deepClone<T>(obj: T extends undefined ? never : T): T {
    return JSON.parse(JSON.stringify(obj));
}
