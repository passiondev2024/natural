import {Component, Inject} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {NaturalAbstractModelService} from '../../../services/abstract-model.service';
import {FilterGroupConditionField} from '../../search/classes/graphql-doctrine.types';
import {NaturalDropdownRef} from '../../search/dropdown-container/dropdown-ref';
import {NATURAL_DROPDOWN_DATA, NaturalDropdownData} from '../../search/dropdown-container/dropdown.service';
import {DropdownComponent} from '../../search/types/dropdown-component';
import {ExtractVall} from '../../../types/types';

export interface TypeSelectNaturalConfiguration<
    TService extends NaturalAbstractModelService<any, any, any, any, any, any, any, any, any, any>
> {
    service: TService;
    placeholder: string;
    filter?: ExtractVall<TService>['filter'];
}

@Component({
    templateUrl: './type-natural-select.component.html',
})
export class TypeNaturalSelectComponent<
    TService extends NaturalAbstractModelService<any, any, any, any, any, any, any, any, any, any>
> implements DropdownComponent {
    public selected: {id: string; name?: string; fullName?: string} | null = null;
    public configuration: TypeSelectNaturalConfiguration<TService>;
    public renderedValue = new BehaviorSubject<string>('');

    private dirty = false;

    constructor(
        @Inject(NATURAL_DROPDOWN_DATA) data: NaturalDropdownData<TypeSelectNaturalConfiguration<TService>>,
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
        if (!this.selected) {
            return {};
        }

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
        return this.selected?.fullName || this.selected?.name || '';
    }
}
