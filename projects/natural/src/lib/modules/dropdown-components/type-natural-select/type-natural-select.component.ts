import {Component} from '@angular/core';
import {NaturalAbstractModelService} from '../../../services/abstract-model.service';
import {FilterGroupConditionField} from '../../search/classes/graphql-doctrine.types';
import {ExtractTone, ExtractVall} from '../../../types/types';
import {AbstractAssociationSelectComponent} from '../abstract-association-select-component.directive';
import {EMPTY, Observable} from 'rxjs';

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
> extends AbstractAssociationSelectComponent<TypeSelectNaturalConfiguration<TService>> {
    public getCondition(): FilterGroupConditionField {
        if (!this.isValid()) {
            return {};
        }

        const id = this.valueCtrl.value?.id;
        const values = id ? [id] : [];

        return this.operatorKeyToCondition(this.operatorCtrl.value, values);
    }

    protected reloadValue(condition: FilterGroupConditionField): Observable<ExtractTone<TService>> {
        if (!condition.have) {
            return EMPTY;
        }

        return this.configuration.service.getOne(condition.have.values[0]);
    }

    protected renderValueWithoutOperator(): string {
        const selected: {id: string; name?: string; fullName?: string} | null = this.valueCtrl.value;
        const selectedName = selected?.fullName || selected?.name || '';

        return selectedName;
    }
}
