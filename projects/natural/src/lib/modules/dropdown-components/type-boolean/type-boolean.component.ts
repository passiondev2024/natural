import {NgFor, NgIf} from '@angular/common';
import {Component, Inject, OnDestroy} from '@angular/core';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {BehaviorSubject} from 'rxjs';
import {NaturalAbstractController} from '../../../classes/abstract-controller';
import {FilterGroupConditionField} from '../../search/classes/graphql-doctrine.types';
import {NATURAL_DROPDOWN_DATA, NaturalDropdownData} from '../../search/dropdown-container/dropdown.service';
import {DropdownComponent} from '../../search/types/dropdown-component';

export interface TypeBooleanConfiguration {
    displayWhenActive: string;
    displayWhenInactive: string;
}

@Component({
    templateUrl: './type-boolean.component.html',
    standalone: true,
    imports: [FormsModule, ReactiveFormsModule, NgIf, NgFor, MatCheckboxModule],
})
export class TypeBooleanComponent extends NaturalAbstractController implements DropdownComponent, OnDestroy {
    public readonly renderedValue: BehaviorSubject<string> = new BehaviorSubject<string>('');

    public readonly formControl = new FormControl<boolean>(true, {nonNullable: true});

    public readonly configuration: Required<TypeBooleanConfiguration>;

    private readonly defaults: Required<TypeBooleanConfiguration> = {
        displayWhenActive: '',
        displayWhenInactive: '',
    };

    public constructor(@Inject(NATURAL_DROPDOWN_DATA) data: NaturalDropdownData<TypeBooleanConfiguration>) {
        super();

        this.configuration = {...this.defaults, ...data.configuration};

        const updateDisplay = (value: boolean): void =>
            this.renderedValue.next(
                value ? this.configuration.displayWhenActive : this.configuration.displayWhenInactive,
            );

        if (data.condition?.equal) {
            this.formControl.setValue(!!data.condition.equal.value);
        }

        // Update rendered value
        this.formControl.valueChanges.subscribe(value => updateDisplay(value));
        updateDisplay(this.formControl.value);
    }

    public getCondition(): FilterGroupConditionField {
        if (!this.isValid()) {
            return {};
        }

        return {equal: {value: this.formControl.value}};
    }

    /**
     * Always valid because checked and unchecked are both valid values
     */
    public isValid(): boolean {
        return true;
    }

    /**
     * Always dirty because even on dropdown opening, the default value is accepted as intentional. There is no "default/empty" state
     */
    public isDirty(): boolean {
        return true;
    }
}
