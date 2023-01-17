import {Component} from '@angular/core';
import {NaturalQueryVariablesManager} from '../../../classes/query-variable-manager';
import {NaturalAbstractModelService} from '../../../services/abstract-model.service';
import {Literal} from '../../../types/types';
import {NaturalHierarchicConfiguration} from '../../hierarchic-selector/classes/hierarchic-configuration';
import {OrganizedModelSelection} from '../../hierarchic-selector/hierarchic-selector/hierarchic-selector.service';
import {FilterGroupConditionField} from '../../search/classes/graphql-doctrine.types';
import {AbstractAssociationSelectComponent} from '../abstract-association-select-component.directive';
import {EMPTY, Observable} from 'rxjs';
import {map} from 'rxjs/operators';

export interface HierarchicFilterConfiguration<T = Literal> {
    service: NaturalHierarchicConfiguration['service'];
    filter: T;
}

export type HierarchicFiltersConfiguration<T = Literal> = Array<HierarchicFilterConfiguration<T>>;

export interface TypeHierarchicSelectorConfiguration {
    key: string;
    service: NaturalAbstractModelService<any, any, any, any, any, any, any, any, any, any>;
    config: NaturalHierarchicConfiguration[];
    filters?: HierarchicFiltersConfiguration;
}

@Component({
    templateUrl: './type-hierarchic-selector.component.html',
})
export class TypeHierarchicSelectorComponent extends AbstractAssociationSelectComponent<TypeHierarchicSelectorConfiguration> {
    public getCondition(): FilterGroupConditionField {
        if (!this.isValid()) {
            return {};
        }

        const ids: string[] =
            this.valueCtrl.value?.[this.configuration.key].map((item: any) => {
                return item.id;
            }) ?? [];

        return this.operatorKeyToCondition(this.operatorCtrl.value, ids);
    }

    protected reloadValue(condition: FilterGroupConditionField): Observable<any | null> {
        if (!condition.have) {
            return EMPTY;
        }

        const ids = condition.have.values;
        const qvm = new NaturalQueryVariablesManager();
        qvm.set('a', {
            filter: {
                groups: [{conditions: [{id: {in: {values: ids}}}]}],
            },
        });

        return this.configuration.service.getAll(qvm).pipe(
            map(v => {
                const selection: OrganizedModelSelection = {};

                selection[this.configuration.key] = v.items;

                return this.noEmptySelection(selection);
            }),
        );
    }

    protected renderValueWithoutOperator(): string {
        const items = this.valueCtrl.value?.[this.configuration.key];
        if (!items) {
            return '';
        }

        return items
            .map((item: any) => {
                return item.fullName || item.name;
            })
            .join(', ');
    }

    public selectionChange(selection: OrganizedModelSelection): void {
        this.valueCtrl.setValue(this.noEmptySelection(selection));
        this.valueCtrl.markAsDirty();
    }

    /**
     * We need to keep `null` in our valueCtrl so the required validator works properly, so
     * filter here
     */
    private noEmptySelection(selection: OrganizedModelSelection): OrganizedModelSelection | null {
        return selection[this.configuration.key].length ? selection : null;
    }
}
