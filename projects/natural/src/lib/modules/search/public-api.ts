/*
 * Public API Surface of natural-search
 */
export { NaturalDropdownData } from './dropdown-container/dropdown.service';
export { FilterGroupConditionField, Filter } from './classes/graphql-doctrine.types';
export { DropdownComponent } from './types/DropdownComponent';
export { FlagFacet, DropdownFacet, Facet, NaturalSearchFacets } from './types/Facet';
export { NaturalSearchSelections, Selection } from './types/Values';
export { NaturalDropdownRef } from './dropdown-container/dropdown-ref';
export { NATURAL_DROPDOWN_DATA } from './dropdown-container/dropdown.service';
export { NaturalSearchModule } from './search.module';
export { toGraphQLDoctrineFilter } from './classes/graphql-doctrine';
export { fromUrl, toUrl } from './classes/url';
