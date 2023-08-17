import {CommonModule} from '@angular/common';
import {Component, Inject} from '@angular/core';
import {FormControl, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {BehaviorSubject} from 'rxjs';
import {Literal} from '../../../types/types';
import {FilterGroupConditionField} from '../../search/classes/graphql-doctrine.types';
import {NaturalDropdownRef} from '../../search/dropdown-container/dropdown-ref';
import {NATURAL_DROPDOWN_DATA, NaturalDropdownData} from '../../search/dropdown-container/dropdown.service';
import {DropdownComponent} from '../../search/types/dropdown-component';
import {isEqual} from 'lodash-es';

export interface TypeOption {
    display: string;
    condition: Literal;
}

export interface TypeOptionsConfiguration {
    options: TypeOption[];
}

@Component({
    templateUrl: './type-options.component.html',
    standalone: true,
    imports: [FormsModule, ReactiveFormsModule, CommonModule, MatButtonToggleModule],
})
export class TypeOptionsComponent implements DropdownComponent {
    public readonly renderedValue: BehaviorSubject<string> = new BehaviorSubject<string>('');

    public readonly formControl = new FormControl<TypeOption>({} as TypeOption, {nonNullable: true});

    public readonly configuration: Required<TypeOptionsConfiguration>;

    private readonly defaults: Required<TypeOptionsConfiguration> = {
        options: [],
    };

    public constructor(
        @Inject(NATURAL_DROPDOWN_DATA) public data: NaturalDropdownData<TypeOptionsConfiguration>,
        protected dropdownRef: NaturalDropdownRef,
    ) {
        this.configuration = {...this.defaults, ...data.configuration};

        if (!this.configuration.options.length) {
            throw new Error('TypeOptions need options, empty array or null given');
        }

        this.formControl.setValidators([Validators.required]);

        if (data.condition) {
            const option = this.configuration.options.find(option => isEqual(option.condition, data.condition));

            if (option) {
                this.formControl.setValue(option);
                this.renderedValue.next(option.display);
            }
        }

        // Update rendered value
        this.formControl.valueChanges.subscribe(option => {
            if (option) {
                this.renderedValue.next(option.display);
                this.dropdownRef.close(option);
            }
        });
    }

    public getCondition(): FilterGroupConditionField {
        if (!this.isValid()) {
            return {};
        }

        return this.formControl.value.condition;
    }

    public isValid(): boolean {
        return this.formControl.valid && !!this.formControl.value?.condition;
    }

    public isDirty(): boolean {
        return this.formControl.dirty;
    }
}
