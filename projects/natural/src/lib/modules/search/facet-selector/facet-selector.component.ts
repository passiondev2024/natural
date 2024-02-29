import {Component, Inject} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {FilterGroupConditionField} from '../../search/classes/graphql-doctrine.types';
import {NaturalDropdownRef} from '../../search/dropdown-container/dropdown-ref';
import {NATURAL_DROPDOWN_DATA, NaturalDropdownData} from '../../search/dropdown-container/dropdown.service';
import {DropdownComponent} from '../types/dropdown-component';
import {Facet, NaturalSearchFacets} from '../types/facet';
import {MatListModule} from '@angular/material/list';

/**
 * Configuration for facet selection
 */
export type FacetSelectorConfiguration = {
    facets: NaturalSearchFacets;
};

@Component({
    templateUrl: './facet-selector.component.html',
    styleUrls: ['./facet-selector.component.scss'],
    standalone: true,
    imports: [MatListModule],
})
export class FacetSelectorComponent implements DropdownComponent {
    // Never has a real value
    public readonly renderedValue = new BehaviorSubject<string>('');
    public facets: NaturalSearchFacets;
    public selection: Facet | null = null;

    public constructor(
        @Inject(NATURAL_DROPDOWN_DATA) public data: NaturalDropdownData<FacetSelectorConfiguration>,
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
