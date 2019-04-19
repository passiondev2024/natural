import { Component, Inject } from '@angular/core';
import { FilterGroupConditionField } from '@angular/material/projects/natural/src/lib/modules/search/classes/graphql-doctrine.types';
import { NaturalDropdownRef } from '@angular/material/projects/natural/src/lib/modules/search/dropdown-container/dropdown-ref';
import {
    NATURAL_DROPDOWN_DATA,
    NaturalDropdownData,
} from '@angular/material/projects/natural/src/lib/modules/search/dropdown-container/dropdown.service';
import { DropdownComponent } from '@angular/material/projects/natural/src/lib/modules/search/types/DropdownComponent';
import { NaturalAbstractModelService } from '@angular/material/projects/natural/src/lib/services/abstract-model.service';
import { BehaviorSubject } from 'rxjs';

export interface SelectNaturalConfiguration {
    service: NaturalAbstractModelService<any, any, any, any, any, any, any, any, any>;
    placeholder: string;
}

@Component({
    templateUrl: './select.component.html',
})
export class SelectComponent implements DropdownComponent {

    public selected;
    public configuration: SelectNaturalConfiguration;
    public renderedValue = new BehaviorSubject<string>('');

    private dirty = false;

    constructor(@Inject(NATURAL_DROPDOWN_DATA)  data: NaturalDropdownData,
                private dropdownRef: NaturalDropdownRef) {
        this.configuration = data.configuration as SelectNaturalConfiguration;

        // Reload selection
        if (data.condition && data.condition.have) {
            // Search beeing unusable without network, we can use getOne() here with force flag
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
