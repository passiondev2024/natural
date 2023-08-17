import {Component} from '@angular/core';
import {NaturalAbstractModelService} from '../../../services/abstract-model.service';
import {FilterGroupConditionField} from '../../search/classes/graphql-doctrine.types';
import {ExtractTone, ExtractVall} from '../../../types/types';
import {AbstractAssociationSelectComponent} from '../abstract-association-select-component.directive';
import {EMPTY, Observable} from 'rxjs';
import {NaturalSelectComponent} from '../../select/select/select.component';
import {MatOptionModule} from '@angular/material/core';
import {CommonModule} from '@angular/common';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

export interface TypeSelectNaturalConfiguration<
    TService extends NaturalAbstractModelService<any, any, any, any, any, any, any, any, any, any>,
> {
    service: TService;
    placeholder: string;
    filter?: ExtractVall<TService>['filter'];
}

@Component({
    templateUrl: './type-natural-select.component.html',
    standalone: true,
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatSelectModule,
        CommonModule,
        MatOptionModule,
        NaturalSelectComponent,
    ],
})
export class TypeNaturalSelectComponent<
    TService extends NaturalAbstractModelService<any, any, any, any, any, any, any, any, any, any>,
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
