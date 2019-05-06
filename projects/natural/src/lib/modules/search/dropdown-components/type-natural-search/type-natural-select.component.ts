import { Component, Inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FilterGroupConditionField } from '../../classes/graphql-doctrine.types';
import { NaturalDropdownRef } from '../../dropdown-container/dropdown-ref';
import { NATURAL_DROPDOWN_DATA, NaturalDropdownData } from '../../dropdown-container/dropdown.service';
import { DropdownComponent } from '../../types/DropdownComponent';
import { NaturalAbstractModelService } from '../../../../services/abstract-model.service';

export interface SelectNaturalConfiguration {
    service: NaturalAbstractModelService<any, any, any, any, any, any, any, any, any>;
    placeholder: string;
}

@Component({
    templateUrl: './type-natural-select.component.html',
})
export class TypeNaturalSelectComponent implements DropdownComponent {

    public selected;
    public configuration: SelectNaturalConfiguration;
    public renderedValue = new BehaviorSubject<string>('');

    private dirty = false;

    constructor(@Inject(NATURAL_DROPDOWN_DATA)  data: NaturalDropdownData,
                private dropdownRef: NaturalDropdownRef) {
        this.configuration = data.configuration as SelectNaturalConfiguration;

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
