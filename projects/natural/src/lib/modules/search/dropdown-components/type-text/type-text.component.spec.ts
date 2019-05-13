import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule, MatInputModule } from '@angular/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FilterGroupConditionField } from '../../classes/graphql-doctrine.types';
import { NaturalDropdownRef } from '../../dropdown-container/dropdown-ref';
import { NATURAL_DROPDOWN_DATA, NaturalDropdownData } from '../../dropdown-container/dropdown.service';

import { TypeTextComponent } from './type-text.component';
import { TypeTextConfiguration } from './TypeTextConfiguration';

describe('TypeTextComponent', () => {
    let component: TypeTextComponent;
    let fixture: ComponentFixture<TypeTextComponent>;
    let dialogCloseSpy: jasmine.Spy;
    const data: NaturalDropdownData = {
        condition: null,
        configuration: null,
    };

    const condition: FilterGroupConditionField = {
        equal: {value: 123},
    };

    const config: TypeTextConfiguration = {};

    const configWithRules: TypeTextConfiguration = {
        min: 10,
        max: 20,
    };

    beforeEach(async(() => {
        const dialogRef = {close: () => true};
        dialogCloseSpy = spyOn(dialogRef, 'close');

        TestBed.configureTestingModule({
            declarations: [TypeTextComponent],
            imports: [
                NoopAnimationsModule,
                FormsModule,
                ReactiveFormsModule,
                MatFormFieldModule,
                MatInputModule,
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

    function createComponent(c: FilterGroupConditionField | null, configuration: TypeTextConfiguration | null) {
        data.condition = c;
        data.configuration = configuration;
        TestBed.overrideProvider(NATURAL_DROPDOWN_DATA, {useValue: data});
        fixture = TestBed.createComponent<TypeTextComponent>(TypeTextComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }

    it('should create', () => {
        createComponent(null, null);
        expect(component).toBeTruthy();
    });

    it('should get condition', () => {
        const empty: any = {
            equal: {value: null},
        };

        const notEmpty: FilterGroupConditionField = {
            equal: {value: 123},
        };

        createComponent(null, null);
        expect(component.getCondition()).toEqual(empty);

        createComponent(condition, config);
        expect(component.getCondition()).toEqual(notEmpty);

        createComponent(condition, configWithRules);
        expect(component.getCondition()).toEqual(notEmpty);
    });

    it('should rendered value as string', () => {
        createComponent(null, null);
        expect(component.renderedValue.value).toBe('');

        createComponent(condition, config);
        expect(component.renderedValue.value).toBe('123');

        createComponent(condition, configWithRules);
        expect(component.renderedValue.value).toBe('123');
    });

    it('should validate according to rules', () => {
        createComponent(null, null);
        expect(component.isValid()).toBe(false);

        createComponent(condition, config);
        expect(component.isValid()).toBe(true);

        createComponent(condition, configWithRules);
        expect(component.isValid()).toBe(false);
    });

    it('should close', () => {
        createComponent(null, null);
        component.close();
        expect(dialogCloseSpy).toHaveBeenCalled();
    });
});
