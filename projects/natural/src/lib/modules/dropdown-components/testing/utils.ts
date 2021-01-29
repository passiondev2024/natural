import {ComponentFixture, fakeAsync} from '@angular/core/testing';
import {FilterGroupConditionField} from '@ecodev/natural';

import {NaturalDropdownData} from '../../search/dropdown-container/dropdown.service';
import {AbstractAssociationSelectComponent} from '../abstract-association-select-component.directive';

const conditionIs: FilterGroupConditionField = {
    have: {values: ['123']},
};

const conditionIsNot: FilterGroupConditionField = {
    have: {values: ['123'], not: true},
};

const conditionAny: FilterGroupConditionField = {
    empty: {not: true},
};

const conditionNone: FilterGroupConditionField = {
    empty: {not: false},
};

export type TestFixture<T extends AbstractAssociationSelectComponent<C>, C> = {
    component: T;
    data: NaturalDropdownData<C>;
    defaultConfiguration: C;
};

type ComponentCreator<T extends AbstractAssociationSelectComponent<C>, C> = (
    t: TestFixture<T, C>,
    condition: FilterGroupConditionField | null,
    configuration: C,
) => void;

export function testAssociationSelect<T extends AbstractAssociationSelectComponent<C>, C>(
    t: TestFixture<T, C>,
    createComponent: ComponentCreator<T, C>,
): void {
    it('should create', fakeAsync(() => {
        createComponent(t, null, t.defaultConfiguration);
        expect(t.component).toBeTruthy();
    }));

    it('should get condition', fakeAsync(() => {
        const invalidCondition: FilterGroupConditionField = {};

        createComponent(t, null, t.defaultConfiguration);
        expect(t.component.getCondition()).toEqual(invalidCondition);

        createComponent(t, conditionIs, t.defaultConfiguration);
        expect(t.component.getCondition()).toEqual(conditionIs);
        expect(t.component.getCondition()).not.toBe(conditionIs);

        createComponent(t, conditionIsNot, t.defaultConfiguration);
        expect(t.component.getCondition()).toEqual(conditionIsNot);
        expect(t.component.getCondition()).not.toBe(conditionIsNot);

        createComponent(t, conditionAny, t.defaultConfiguration);
        expect(t.component.getCondition()).toEqual(conditionAny);
        expect(t.component.getCondition()).not.toBe(conditionAny);

        createComponent(t, conditionNone, t.defaultConfiguration);
        expect(t.component.getCondition()).toEqual(conditionNone);
        expect(t.component.getCondition()).not.toBe(conditionNone);
    }));

    it('should rendered value as string', fakeAsync(() => {
        createComponent(t, null, t.defaultConfiguration);
        expect(t.component.renderedValue.value).toBe('');

        createComponent(t, conditionIs, t.defaultConfiguration);
        expect(t.component.renderedValue.value).toBe('est name-123');

        createComponent(t, conditionIsNot, t.defaultConfiguration);
        expect(t.component.renderedValue.value).toBe("n'est pas name-123");

        createComponent(t, conditionAny, t.defaultConfiguration);
        expect(t.component.renderedValue.value).toBe('tous');

        createComponent(t, conditionNone, t.defaultConfiguration);
        expect(t.component.renderedValue.value).toBe('aucun');
    }));

    it('should validate if at least one selection', fakeAsync(() => {
        createComponent(t, null, t.defaultConfiguration);
        expect(t.component.isValid()).toBe(false);

        t.component.valueCtrl.setValue({id: 456});
        expect(t.component.isValid()).toBe(true);
    }));

    it('should validate if operator does not require selection', fakeAsync(() => {
        createComponent(t, null, t.defaultConfiguration);
        expect(t.component.isValid()).toBe(false);

        t.component.operatorCtrl.setValue('empty');
        expect(t.component.isValid()).toBe(true);

        // Then should not validate if require a selection
        t.component.operatorCtrl.setValue('isnot');
        expect(t.component.isValid()).toBe(false);

        t.component.operatorCtrl.setValue('have');
        expect(t.component.isValid()).toBe(true);

        t.component.operatorCtrl.setValue('is');
        expect(t.component.isValid()).toBe(false);

        // Finally `is` operator with value is valid
        t.component.valueCtrl.setValue({id: 456});
        expect(t.component.isValid()).toBe(true);
    }));
}
