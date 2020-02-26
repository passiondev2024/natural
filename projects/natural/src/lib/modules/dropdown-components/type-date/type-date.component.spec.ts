import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { DateAdapter, MAT_DATE_LOCALE, MatNativeDateModule, NativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
    FilterGroupConditionField,
    NATURAL_DROPDOWN_DATA,
    NaturalDropdownData,
    TypeDateComponent,
    TypeDateConfiguration,
} from '@ecodev/natural';
import '@angular/localize/init';
import { Injectable } from '@angular/core';

@Injectable()
class ImpossibleParsingDateAdapter extends NativeDateAdapter {
    public parse(value: unknown): Date | null {
        throw new Error('`parse` method should never be called at all');
    }
}

describe('TypeDateComponent', () => {
    let component: TypeDateComponent;
    let fixture: ComponentFixture<TypeDateComponent>;
    const data: NaturalDropdownData<TypeDateConfiguration | null> = {
        condition: null,
        configuration: null,
    };

    const conditionGreaterOrEqual: FilterGroupConditionField = {
        greaterOrEqual: {value: '2012-01-05'},
    };

    const conditionGreater: FilterGroupConditionField = {
        greater: {value: '2012-01-05'},
    };

    const conditionLessOrEqual: FilterGroupConditionField = {
        lessOrEqual: {value: '2018-01-05'},
    };

    const conditionLess: FilterGroupConditionField = {
        less: {value: '2018-01-05'},
    };

    const conditionEqual: FilterGroupConditionField = {
        greaterOrEqual: {value: '2018-01-05'},
        less: {value: '2018-01-06'},
    };

    const conditionInvalidRangeEqual: FilterGroupConditionField = {
        greaterOrEqual: {value: '2018-01-05'},
        less: {value: '2019-09-09'},
    };

    const config: TypeDateConfiguration<Date> = {};

    const configWithRules: TypeDateConfiguration<Date> = {
        min: new Date('2001-01-01'),
        max: new Date('2010-01-01'),
    };

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [TypeDateComponent],
            imports: [
                NoopAnimationsModule,
                FormsModule,
                ReactiveFormsModule,
                MatFormFieldModule,
                MatInputModule,
                MatSelectModule,
                MatDatepickerModule,
                MatNativeDateModule,
            ],
            providers: [
                {
                    provide: NATURAL_DROPDOWN_DATA,
                    useValue: data,
                },
                {
                    provide: MAT_DATE_LOCALE,
                    useValue: 'fr',
                },
                {
                    provide: DateAdapter,
                    useClass: ImpossibleParsingDateAdapter,
                },
            ],
        }).compileComponents();
    }));

    function createComponent(
        c: FilterGroupConditionField | null,
        configuration: TypeDateConfiguration<Date> | null,
    ) {
        data.condition = c;
        data.configuration = configuration;
        TestBed.overrideProvider(NATURAL_DROPDOWN_DATA, {useValue: data});
        fixture = TestBed.createComponent<TypeDateComponent>(TypeDateComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }

    it('should create', () => {
        createComponent(null, null);
        expect(component).toBeTruthy();
    });

    it('should get condition', () => {
        const empty: FilterGroupConditionField = {};

        createComponent(null, null);
        expect(component.getCondition()).toEqual(empty);

        createComponent(conditionGreaterOrEqual, config);
        expect(component.getCondition()).toEqual(conditionGreaterOrEqual);

        createComponent(conditionGreaterOrEqual, configWithRules);
        expect(component.getCondition()).toEqual(conditionGreaterOrEqual);

        createComponent(conditionGreater, configWithRules);
        expect(component.getCondition()).toEqual({
            greaterOrEqual: {value: '2012-01-06'},
        }, 'should automatically change to greaterOrEqual');

        createComponent(conditionLessOrEqual, configWithRules);
        expect(component.getCondition()).toEqual({
            less: {value: '2018-01-06'},
        }, 'should automatically change to less');

        createComponent(conditionLess, configWithRules);
        expect(component.getCondition()).toEqual(conditionLess);

        createComponent(conditionEqual, configWithRules);
        expect(component.getCondition()).toEqual(conditionEqual);

        createComponent(conditionEqual, configWithRules);
        expect(component.getCondition()).toEqual(conditionEqual);

        createComponent(conditionInvalidRangeEqual, configWithRules);
        expect(component.getCondition()).toEqual(conditionEqual, 'should transparently accept invalid range and fix it');
    });

    it('should rendered value as string', () => {
        createComponent(null, null);
        expect(component.renderedValue.value).toBe('');

        createComponent(conditionGreaterOrEqual, config);
        expect(component.renderedValue.value).toBe('≥ 05/01/2012');

        createComponent(conditionGreaterOrEqual, configWithRules);
        expect(component.renderedValue.value).toBe('≥ 05/01/2012');

        createComponent(conditionGreater, configWithRules);
        expect(component.renderedValue.value).toBe('> 05/01/2012');

        createComponent(conditionLessOrEqual, configWithRules);
        expect(component.renderedValue.value).toBe('≤ 05/01/2018');

        createComponent(conditionLess, configWithRules);
        expect(component.renderedValue.value).toBe('< 05/01/2018');

        createComponent(conditionEqual, configWithRules);
        expect(component.renderedValue.value).toBe('= 05/01/2018');
    });

    it('should validate according to rules', () => {
        createComponent(null, null);
        expect(component.isValid()).toBe(false);

        createComponent(conditionGreaterOrEqual, config);
        expect(component.isValid()).toBe(true);

        createComponent(conditionGreaterOrEqual, configWithRules);
        expect(component.isValid()).toBe(false);
    });
});
