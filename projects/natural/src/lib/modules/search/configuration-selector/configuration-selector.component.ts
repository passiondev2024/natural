import { Component, Inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FilterGroupConditionField } from '../../search/classes/graphql-doctrine.types';
import { NaturalDropdownRef } from '../../search/dropdown-container/dropdown-ref';
import { NATURAL_DROPDOWN_DATA, NaturalDropdownData } from '../../search/dropdown-container/dropdown.service';
import { NaturalSearchConfiguration } from '../../search/types/Configuration';
import { DropdownComponent } from '../../search/types/DropdownComponent';

/**
 * Configuration for selection
 */
export interface ConfigurationSelectorConfiguration {
    configurations: NaturalSearchConfiguration;
}

@Component({
    templateUrl: './configuration-selector.component.html',
    styleUrls: ['./configuration-selector.component.scss'],
})
export class ConfigurationSelectorComponent implements DropdownComponent {
    // Never has a real value
    public renderedValue = new BehaviorSubject<string>('');

    public configurations: NaturalSearchConfiguration;

    public selection;

    constructor(@Inject(NATURAL_DROPDOWN_DATA) data: NaturalDropdownData,
                protected dropdownRef: NaturalDropdownRef) {
        this.configurations = (data.configuration as ConfigurationSelectorConfiguration).configurations;
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
                configuration: this.selection,
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
