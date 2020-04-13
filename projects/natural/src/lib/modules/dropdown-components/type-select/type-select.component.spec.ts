import { CommonModule } from '@angular/common';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatListModule } from '@angular/material/list';
import {
    FilterGroupConditionField,
    NaturalDropdownRef,
    TypeSelectComponent,
    TypeSelectConfiguration,
} from '@ecodev/natural';
import { BehaviorSubject } from 'rxjs';
import { NaturalDropdownContainerComponent } from '../../search/dropdown-container/dropdown-container.component';

import { NATURAL_DROPDOWN_DATA, NaturalDropdownData } from '../../search/dropdown-container/dropdown.service';
import { TypeSelectItem } from './type-select.component';

describe('TypeSelectComponent', () => {
    let component: TypeSelectComponent;
    let fixture: ComponentFixture<TypeSelectComponent>;
    let dialogCloseSpy: jasmine.Spy;
    const data: NaturalDropdownData = {
        condition: null,
        configuration: null,
    };

    const condition: FilterGroupConditionField = {
        in: {values: ['bar', 'baz']},
    };

    const configScalar: TypeSelectConfiguration = {
        items: [
            'foo',
            'bar',
            'baz',
        ],
    };

    const configObject: TypeSelectConfiguration = {
        items: [
            {id: 'foo', name: 'foo label'},
            {id: 'bar', name: 'bar label'},
            {id: 'baz', name: 'baz label'},
        ],
    };

    const configObservable: TypeSelectConfiguration = {
        items: new BehaviorSubject<TypeSelectItem[]>([
            {id: 'foo', name: 'foo label'},
            {id: 'bar', name: 'bar label'},
            {id: 'baz', name: 'baz label'},
        ]),
    };

    const configSingle: TypeSelectConfiguration = {
        items: [
            'foo',
            'bar',
            'baz',
        ],
        multiple: false,
    };

    beforeEach(async(() => {
        const dialogRef = {close: () => true};
        dialogCloseSpy = spyOn(dialogRef, 'close');

        TestBed.configureTestingModule({
            declarations: [
                TypeSelectComponent,
                NaturalDropdownContainerComponent,
            ],
            imports: [
                CommonModule,
                FormsModule,
                MatListModule,
            ],
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
    }));

    function createComponent(c: FilterGroupConditionField | null, configuration: TypeSelectConfiguration | null) {
        data.condition = c;
        data.configuration = configuration;
        TestBed.overrideProvider(NATURAL_DROPDOWN_DATA, {useValue: data});
        fixture = TestBed.createComponent<TypeSelectComponent>(TypeSelectComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
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

    it('should get condition', () => {
        const empty: FilterGroupConditionField = {
            in: {values: []},
        };

        const notEmpty: FilterGroupConditionField = {
            in: {values: ['bar', 'baz']},
        };

        createComponent(null, null);
        expect(component.getCondition()).toEqual(empty);

        createComponent(condition, configScalar);
        expect(component.getCondition()).toEqual(notEmpty);

        createComponent(condition, configObject);
        expect(component.getCondition()).toEqual(notEmpty);

        createComponent(condition, configObservable);
        expect(component.getCondition()).toEqual(notEmpty);
    });

    it('should rendered value joined by comma', () => {
        createComponent(null, null);
        expect(component.renderedValue.value).toBe('');

        createComponent(condition, configScalar);
        expect(component.renderedValue.value).toBe('bar, baz');

        createComponent(condition, configObject);
        expect(component.renderedValue.value).toBe('bar label, baz label');

        createComponent(condition, configObservable);
        expect(component.renderedValue.value).toBe('bar label, baz label');
    });

    it('should validate if at least one selection', () => {
        createComponent(null, null);
        expect(component.isValid()).toBe(false);

        component.selected.push('foo');
        expect(component.isValid()).toBe(true);
    });

    it('should not close if multiple', () => {
        createComponent(null, null);
        component.closeIfSingleAndHasValue();
        expect(dialogCloseSpy).not.toHaveBeenCalled();

        createComponent(condition, configScalar);
        component.closeIfSingleAndHasValue();
        expect(dialogCloseSpy).not.toHaveBeenCalled();
    });

    it('should not close if single but has no value', () => {
        createComponent(null, configSingle);
        component.closeIfSingleAndHasValue();
        expect(dialogCloseSpy).not.toHaveBeenCalled();
    });

    it('should close if single and has value', () => {
        createComponent(condition, configSingle);
        component.closeIfSingleAndHasValue();

        expect(dialogCloseSpy).toHaveBeenCalledWith({
            condition: {in: {values: ['bar', 'baz']}},
        });
    });
});
