import {Component} from '@angular/core';
import {FilterGroupConditionField} from '../../search/classes/graphql-doctrine.types';
import {ExtractTone, ExtractVall, UntypedModelService} from '../../../types/types';
import {AbstractAssociationSelectComponent} from '../abstract-association-select-component.directive';
import {EMPTY, Observable} from 'rxjs';
import {NaturalSelectComponent} from '../../select/select/select.component';
import {MatOptionModule} from '@angular/material/core';

import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

export interface TypeSelectNaturalConfiguration<TService extends UntypedModelService> {
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
        MatOptionModule,
        NaturalSelectComponent,
    ],
})
export class TypeNaturalSelectComponent<
    TService extends UntypedModelService,
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
