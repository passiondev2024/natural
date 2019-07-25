import { Facet, NaturalSearchFacets } from '../types/Facet';
import { Selection } from '../types/Values';

/**
 * Lookup a facet by its `name` and then by its `field`, or return null if not found
 */
export function getFacetFromSelection(facets: NaturalSearchFacets | null,
                                      selection: Selection): Facet | null {

    if (!facets) {
        return null;
    }

    return facets.find(facet => facet.name != null && facet.name === selection.name) ||
           facets.find(facet => facet.field === selection.field) ||
           null;
}

export function deepClone(obj: any): any {
    return JSON.parse(JSON.stringify(obj));
}
