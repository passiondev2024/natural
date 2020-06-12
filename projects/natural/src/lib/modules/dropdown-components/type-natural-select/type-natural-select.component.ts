import {Component, Inject} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {NaturalAbstractModelService} from '../../../services/abstract-model.service';
import {Literal} from '../../../types/types';
import {FilterGroupConditionField} from '../../search/classes/graphql-doctrine.types';
import {NaturalDropdownRef} from '../../search/dropdown-container/dropdown-ref';
import {NATURAL_DROPDOWN_DATA, NaturalDropdownData} from '../../search/dropdown-container/dropdown.service';
import {DropdownComponent} from '../../search/types/dropdown-component';

export interface TypeSelectNaturalConfiguration {
    service: NaturalAbstractModelService<any, any, any, any, any, any, any, any, any>;
    placeholder: string;
    filter: Literal;
}

@Component({
    templateUrl: './type-natural-select.component.html',
})
export class TypeNaturalSelectComponent implements DropdownComponent {
    public selected;
    public configuration: TypeSelectNaturalConfiguration;
    public renderedValue = new BehaviorSubject<string>('');

    private dirty = false;

    constructor(
        @Inject(NATURAL_DROPDOWN_DATA) data: NaturalDropdownData<TypeSelectNaturalConfiguration>,
        private dropdownRef: NaturalDropdownRef,
    ) {
        this.configuration = data.configuration;

        // Reload selection
        if (data.condition && data.condition.have) {
            this.configuration.service.getOne(data.condition.have.values[0]).subscribe(v => {
                this.selected = v;
                this.renderedValue.next(this.getRenderedValue());
            });
        }
    }

    public isValid(): boolean {
        return this.selected !== null;
    }

    public isDirty(): boolean {
        return this.dirty;
    }

    public getCondition(): FilterGroupConditionField {
        return {
            have: {values: [this.selected.id]},
        };
    }

    public closeIfValid(): void {
        this.dirty = true;

        if (this.isValid()) {
            this.renderedValue.next(this.getRenderedValue());

            this.dropdownRef.close({
                condition: this.getCondition(),
            });
        }
    }

    private getRenderedValue(): string {
        if (this.selected) {
            return this.selected.fullName || this.selected.name;
        }

        return '';
    }
}
