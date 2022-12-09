/*
 * Public API Surface of natural-search
 */
export {NaturalDropdownData} from './dropdown-container/dropdown.service';
export {FilterGroupConditionField, Filter} from './classes/graphql-doctrine.types';
export {DropdownComponent} from './types/dropdown-component';
export {FlagFacet, DropdownFacet, Facet, NaturalSearchFacets} from './types/facet';
export {NaturalSearchSelections, NaturalSearchSelection} from './types/values';
export {NaturalDropdownRef} from './dropdown-container/dropdown-ref';
export {NATURAL_DROPDOWN_DATA} from './dropdown-container/dropdown.service';
export {NaturalSearchModule} from './search.module';
export {toGraphQLDoctrineFilter} from './classes/graphql-doctrine';
export {fromUrl, toUrl, toNavigationParameters} from './classes/url';
export {replaceOperatorByName, wrapLike, replaceOperatorByField} from './classes/transformers';
export {NaturalSearchComponent} from './search/search.component';
