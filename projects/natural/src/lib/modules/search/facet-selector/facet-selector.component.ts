import {Component, Inject} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {FilterGroupConditionField} from '../../search/classes/graphql-doctrine.types';
import {NaturalDropdownRef} from '../../search/dropdown-container/dropdown-ref';
import {NATURAL_DROPDOWN_DATA, NaturalDropdownData} from '../../search/dropdown-container/dropdown.service';
import {DropdownComponent} from '../types/dropdown-component';
import {Facet, NaturalSearchFacets} from '../types/facet';

/**
 * Configuration for facet selection
 */
export interface FacetSelectorConfiguration {
    facets: NaturalSearchFacets;
}

@Component({
    templateUrl: './facet-selector.component.html',
    styleUrls: ['./facet-selector.component.scss'],
})
export class FacetSelectorComponent implements DropdownComponent {
    // Never has a real value
    public renderedValue = new BehaviorSubject<string>('');
    public facets: NaturalSearchFacets;
    public selection: Facet | null = null;

    constructor(
        @Inject(NATURAL_DROPDOWN_DATA) data: NaturalDropdownData<FacetSelectorConfiguration>,
        protected dropdownRef: NaturalDropdownRef,
    ) {
        this.facets = data.configuration.facets;
    }

    /**
     * Get value, including rich object types
     */
    public getCondition(): FilterGroupConditionField {
        return {};
    }

    /**
     * Allow to close the dropdown with a valid value
     */
    public close(): void {
        if (this.selection) {
            this.dropdownRef.close({
                condition: {},
                facet: this.selection,
            });
        }
    }

    public isValid(): boolean {
        return !!this.selection;
    }

    public isDirty(): boolean {
        return true;
    }
}
