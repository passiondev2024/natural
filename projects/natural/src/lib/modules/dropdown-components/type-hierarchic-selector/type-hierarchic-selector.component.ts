import { Component, Inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { NaturalQueryVariablesManager } from '../../../classes/query-variable-manager';
import { NaturalAbstractModelService } from '../../../services/abstract-model.service';
import { Literal } from '../../../types/types';
import { OrganizedModelSelection } from '../../hierarchic-selector/services/hierarchic-selector.service';
import { FilterGroupConditionField } from '../../search/classes/graphql-doctrine.types';
import { NaturalDropdownRef } from '../../search/dropdown-container/dropdown-ref';
import { NATURAL_DROPDOWN_DATA, NaturalDropdownData } from '../../search/dropdown-container/dropdown.service';
import { DropdownComponent } from '../../search/types/DropdownComponent';
import { HierarchicConfiguration } from './HierarchicConfiguration';

export interface HierarchicFilterConfiguration<T = Literal> {
    service: HierarchicConfiguration['service'];
    filter: T;
}

export interface HierarchicFiltersConfiguration<T = Literal> extends Array<HierarchicFilterConfiguration<T>> {
}

export interface TypeHierarchicSelectorConfiguration {
    key: string;
    service: NaturalAbstractModelService<any, any, any, any, any, any, any, any, any>;
    config: HierarchicConfiguration[];
    filters?: HierarchicFiltersConfiguration;
}

@Component({
    templateUrl: './type-hierarchic-selector.component.html',
})
export class TypeHierarchicSelectorComponent implements DropdownComponent {

    public selected: OrganizedModelSelection;
    public configuration: TypeHierarchicSelectorConfiguration;
    public renderedValue = new BehaviorSubject<string>('');

    private dirty = false;

    constructor(
        @Inject(NATURAL_DROPDOWN_DATA) data: NaturalDropdownData<TypeHierarchicSelectorConfiguration>,
        private dropdownRef: NaturalDropdownRef,
    ) {
        this.configuration = data.configuration;

        this.reloadCondition(data.condition);
    }

    private reloadCondition(condition: FilterGroupConditionField | null): void {
        if (!condition || !condition.have) {
            return;
        }

        const ids = condition.have.values;
        const qvm = new NaturalQueryVariablesManager();
        qvm.set('a', {
            filter: {
                groups: [{conditions: [{id: {in: {values: ids}}}]}],
            },
        });

        this.configuration.service.getAll(qvm).subscribe(v => {
            this.selected = {};
            this.selected[this.configuration.key] = v.items;
            this.renderedValue.next(this.getRenderedValue());
        });
    }

    private getRenderedValue(): string {

        if (!this.selected || !this.selected[this.configuration.key]) {
            return '';
        }

        return this.selected[this.configuration.key].map(item => {
            return item.fullName || item.name;
        }).join(', ');
    }

    public isValid(): boolean {
        return this.selected !== null;
    }

    public isDirty(): boolean {
        return this.dirty;
    }

    public getCondition(): FilterGroupConditionField {
        const ids = this.selected[this.configuration.key].map(item => {
            return item.id;
        });

        return {
            have: {values: ids},
        };
    }

    public selectionChange(e: OrganizedModelSelection): void {
        this.selected = e;
        this.dirty = true;
    }

    public close(): void {
        if (this.isValid()) {
            this.dropdownRef.close({condition: this.getCondition()});
        } else {
            this.dropdownRef.close(); // undefined value, discard changes / prevent to add a condition (on new fields
        }
    }
}
