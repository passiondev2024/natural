import {CommonModule} from '@angular/common';
import {Component, Inject} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NATURAL_DROPDOWN_DATA, NaturalDropdownData} from '../../search/dropdown-container/dropdown.service';
import {DropdownComponent} from '../../search/types/dropdown-component';
import {TypeOptionsComponent, TypeOptionsConfiguration} from '../type-options/type-options.component';
import {NaturalDropdownRef} from '../../search/dropdown-container/dropdown-ref';
import {MatButtonToggleModule} from '@angular/material/button-toggle';

export interface TypeBooleanConfiguration {
    displayWhenActive: string;
    displayWhenInactive: string;
}

@Component({
    templateUrl: '../type-options/type-options.component.html',
    standalone: true,
    imports: [FormsModule, ReactiveFormsModule, CommonModule, MatButtonToggleModule],
})
export class TypeBooleanComponent extends TypeOptionsComponent implements DropdownComponent {
    public constructor(
        @Inject(NATURAL_DROPDOWN_DATA) data: NaturalDropdownData<TypeBooleanConfiguration>,
        dropdownRef: NaturalDropdownRef,
    ) {
        // Set up options from hardcoded conditions with custom labels from config
        const configuration: TypeOptionsConfiguration = {
            options: [
                {
                    display: data.configuration.displayWhenActive,
                    condition: {equal: {value: true}},
                },
                {
                    display: data.configuration.displayWhenInactive,
                    condition: {equal: {value: false}},
                },
            ],
        };

        const typeOptionsData: NaturalDropdownData<TypeOptionsConfiguration> = {
            ...data,
            ...{configuration: configuration},
        };

        super(typeOptionsData, dropdownRef);
    }
}
