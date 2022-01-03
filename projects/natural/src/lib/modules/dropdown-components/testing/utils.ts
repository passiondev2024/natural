import {fakeAsync} from '@angular/core/testing';
import {FilterGroupConditionField} from '../../search/classes/graphql-doctrine.types';
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
};

type ComponentCreator<T extends AbstractAssociationSelectComponent<C>, C> = (
    t: TestFixture<T, C>,
    condition: FilterGroupConditionField | null,
) => void;

export function testAssociationSelect<T extends AbstractAssociationSelectComponent<C>, C>(
    t: TestFixture<T, C>,
    createComponent: ComponentCreator<T, C>,
): void {
    it('should create', fakeAsync(() => {
        createComponent(t, null);
        expect(t.component).toBeTruthy();
    }));

    it('should get empty condition without value', fakeAsync(() => {
        const empty: FilterGroupConditionField = {};

        createComponent(t, null);
        expect(t.component.getCondition()).toEqual(empty);
    }));

    it('should get `is` condition', fakeAsync(() => {
        createComponent(t, conditionIs);
        expect(t.component.getCondition()).toEqual(conditionIs);
        expect(t.component.getCondition()).not.toBe(conditionIs);
    }));

    it('should get `isNot` condition', fakeAsync(() => {
        createComponent(t, conditionIsNot);
        expect(t.component.getCondition()).toEqual(conditionIsNot);
        expect(t.component.getCondition()).not.toBe(conditionIsNot);
    }));

    it('should get `any` condition', fakeAsync(() => {
        createComponent(t, conditionAny);
        expect(t.component.getCondition()).toEqual(conditionAny);
        expect(t.component.getCondition()).not.toBe(conditionAny);
    }));

    it('should get `none` condition', fakeAsync(() => {
        createComponent(t, conditionNone);
        expect(t.component.getCondition()).toEqual(conditionNone);
        expect(t.component.getCondition()).not.toBe(conditionNone);
    }));

    it('should render `null` as empty string', fakeAsync(() => {
        createComponent(t, null);
        expect(t.component.renderedValue.value).toBe('');
    }));

    it('should render `is` value as string', fakeAsync(() => {
        createComponent(t, conditionIs);
        expect(t.component.renderedValue.value).toBe('est name-123');
    }));

    it('should render `isNot` value as string', fakeAsync(() => {
        createComponent(t, conditionIsNot);
        expect(t.component.renderedValue.value).toBe("n'est pas name-123");
    }));

    it('should render `any` value as string', fakeAsync(() => {
        createComponent(t, conditionAny);
        expect(t.component.renderedValue.value).toBe('tous');
    }));

    it('should render `none` value as string', fakeAsync(() => {
        createComponent(t, conditionNone);
        expect(t.component.renderedValue.value).toBe('aucun');
    }));

    it('should validate if at least one selection', fakeAsync(() => {
        createComponent(t, null);
        expect(t.component.isValid()).toBe(false);

        t.component.valueCtrl.setValue({id: 456});
        expect(t.component.isValid()).toBe(true);
    }));

    it('should validate if operator does not require selection', fakeAsync(() => {
        createComponent(t, null);
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
