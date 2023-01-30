import {CommonModule} from '@angular/common';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatLegacyListModule as MatListModule} from '@angular/material/legacy-list';
import {
    FilterGroupConditionField,
    NaturalDropdownRef,
    TypeSelectComponent,
    TypeSelectConfiguration,
} from '@ecodev/natural';
import {of} from 'rxjs';

import {NATURAL_DROPDOWN_DATA, NaturalDropdownData} from '../../search/dropdown-container/dropdown.service';
import {MatLegacyFormFieldModule as MatFormFieldModule} from '@angular/material/legacy-form-field';

describe('TypeSelectComponent', () => {
    let component: TypeSelectComponent;
    let fixture: ComponentFixture<TypeSelectComponent>;
    const data: NaturalDropdownData = {
        condition: null,
        configuration: null,
    };

    const conditionIs: FilterGroupConditionField = {
        in: {values: ['bar', 'baz']},
    };

    const conditionIsNot: FilterGroupConditionField = {
        in: {values: ['bar', 'baz'], not: true},
    };

    const conditionAny: FilterGroupConditionField = {
        null: {not: true},
    };

    const conditionNone: FilterGroupConditionField = {
        null: {not: false},
    };

    const configScalar: TypeSelectConfiguration = {
        items: ['foo', 'bar', 'baz'],
    };

    const configObject: TypeSelectConfiguration = {
        items: [
            {id: 'foo', name: 'foo label'},
            {id: 'bar', name: 'bar label'},
            {id: 'baz', name: 'baz label'},
        ],
    };

    const configObservable: TypeSelectConfiguration = {
        items: of([
            {id: 'foo', name: 'foo label'},
            {id: 'bar', name: 'bar label'},
            {id: 'baz', name: 'baz label'},
        ]),
    };

    const configSingle: TypeSelectConfiguration = {
        items: ['foo', 'bar', 'baz'],
        multiple: false,
    };

    const configNoOperators: TypeSelectConfiguration = {
        items: ['foo', 'bar', 'baz'],
        operators: false,
    };

    beforeEach(async () => {
        const dialogRef = {close: () => true};

        await TestBed.configureTestingModule({
            declarations: [TypeSelectComponent],
            imports: [CommonModule, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatListModule],
            providers: [
                {
                    provide: NATURAL_DROPDOWN_DATA,
                    useValue: data,
                },
                {
                    provide: NaturalDropdownRef,
                    useValue: dialogRef,
                },
            ],
        }).compileComponents();
    });

    function createComponent(c: FilterGroupConditionField | null, configuration: TypeSelectConfiguration | null): void {
        data.condition = c;
        data.configuration = configuration;
        TestBed.overrideProvider(NATURAL_DROPDOWN_DATA, {useValue: data});
        fixture = TestBed.createComponent<TypeSelectComponent>(TypeSelectComponent);
        component = fixture.componentInstance;
    }

    it('should create', () => {
        createComponent(null, null);
        expect(component).toBeTruthy();
    });

    it('should get id', () => {
        createComponent(null, null);
        expect(component.getId('foo')).toBe('foo');
        expect(component.getId(123)).toBe(123);
        expect(component.getId(true)).toBe(true);
        expect(component.getId(false)).toBe(false);
        expect(component.getId({id: 123, name: 'foo'})).toBe(123);
        expect(component.getId({value: 123, name: 'foo'})).toBe(123);
    });

    it('should get display', () => {
        createComponent(null, null);
        expect(component.getDisplay('foo')).toBe('foo');
        expect(component.getDisplay(123)).toBe(123);
        expect(component.getDisplay(true)).toBe(true);
        expect(component.getDisplay(false)).toBe(false);
        expect(component.getDisplay({id: 123, name: 'foo'})).toBe('foo');
        expect(component.getDisplay({value: 123, name: 'foo'})).toBe('foo');
    });

    it('should get empty condition without value', () => {
        const empty: FilterGroupConditionField = {};

        createComponent(null, null);
        expect(component.getCondition()).toEqual(empty);
    });

    it('should get `is` condition with scalar config', () => {
        createComponent(conditionIs, configScalar);
        expect(component.getCondition()).toEqual(conditionIs);
        expect(component.getCondition()).not.toBe(conditionIs);
    });

    it('should get `isNot` condition with scalar config', () => {
        createComponent(conditionIsNot, configScalar);
        expect(component.getCondition()).toEqual(conditionIsNot);
        expect(component.getCondition()).not.toBe(conditionIsNot);
    });

    it('should get `any` condition with scalar config', () => {
        createComponent(conditionAny, configScalar);
        expect(component.getCondition()).toEqual(conditionAny);
        expect(component.getCondition()).not.toBe(conditionAny);
    });

    it('should get `none` condition with scalar config', () => {
        createComponent(conditionNone, configScalar);
        expect(component.getCondition()).toEqual(conditionNone);
        expect(component.getCondition()).not.toBe(conditionNone);
    });

    it('should get `is` condition with object config', () => {
        createComponent(conditionIs, configObject);
        expect(component.getCondition()).toEqual(conditionIs);
    });

    it('should get `is` condition with observable config', () => {
        createComponent(conditionIs, configObservable);
        expect(component.getCondition()).toEqual(conditionIs);
    });

    it('should get `is` condition with single config', () => {
        // Single value is actually not enforced, but it should at least not crash
        createComponent(conditionIs, configSingle);
        expect(component.getCondition()).toEqual(conditionIs);
    });

    it('should rendered `null` as empty string', () => {
        createComponent(null, null);
        expect(component.renderedValue.value).toBe('');
    });

    it('should rendered `is` value joined by comma', () => {
        createComponent(conditionIs, configScalar);
        expect(component.renderedValue.value).toBe('est bar, baz');
    });

    it('should rendered `isNot` value joined by comma', () => {
        createComponent(conditionIsNot, configScalar);
        expect(component.renderedValue.value).toBe("n'est pas bar, baz");
    });

    it('should rendered `any` value joined by comma', () => {
        createComponent(conditionAny, configScalar);
        expect(component.renderedValue.value).toBe('tous');
    });

    it('should rendered `none` value joined by comma', () => {
        createComponent(conditionNone, configScalar);
        expect(component.renderedValue.value).toBe('aucun');
    });

    it('should rendered `is` value joined by comma with object config', () => {
        createComponent(conditionIs, configObject);
        expect(component.renderedValue.value).toBe('est bar label, baz label');
    });

    it('should rendered `is` value joined by comma with observable config', () => {
        createComponent(conditionIs, configObservable);
        expect(component.renderedValue.value).toBe('est bar label, baz label');
    });

    it('should rendered `is` value joined by comma with single config', () => {
        // Single value is actually not enforced, but it should at least not crash
        createComponent(conditionIs, configSingle);
        expect(component.renderedValue.value).toBe('est bar, baz');
    });

    it('should validate if at least one selection', () => {
        createComponent(null, null);
        expect(component.isValid()).toBe(false);

        component.valueCtrl.setValue(['foo']);
        expect(component.isValid()).toBe(true);
    });

    it('should validate if operator does not require selection', () => {
        createComponent(null, configScalar);
        expect(component.isValid()).toBe(false);

        component.operatorCtrl.setValue('none');
        expect(component.isValid()).toBe(true);

        // Then should not validate if require a selection
        component.operatorCtrl.setValue('isnot');
        expect(component.isValid()).toBe(false);

        component.operatorCtrl.setValue('any');
        expect(component.isValid()).toBe(true);

        component.operatorCtrl.setValue('is');
        expect(component.isValid()).toBe(false);

        // Finally `is` operator with value is valid
        component.valueCtrl.setValue({id: 456});
        expect(component.isValid()).toBe(true);
    });

    it('no operators config should get `is` condition', () => {
        // Single value is actually not enforced, but it should at least not crash
        createComponent(conditionIs, configNoOperators);
        expect(component.getCondition()).toEqual(conditionIs);
    });

    it('no operators config should coerce other operators into `is`', () => {
        // Single value is actually not enforced, but it should at least not crash
        createComponent(conditionIsNot, configNoOperators);
        expect(component.isValid()).toBeTrue();
        expect(component.getCondition()).toEqual(conditionIs);
    });
});
