import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TypeDateRangeComponent } from './type-date-range.component';
import { MatFormFieldModule, MatInputModule, MatDatepickerModule, MatNativeDateModule } from '@angular/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FilterGroupConditionField } from '../../classes/graphql-doctrine.types';
import { TypeDateRangeConfiguration } from './TypeDateRangeConfiguration';
import {
    NATURAL_DROPDOWN_DATA,
    NaturalDropdownData,
} from '../../dropdown-container/dropdown.service';
import { MAT_DATE_LOCALE } from '@angular/material';

describe('TypeDateRangeComponent', () => {
    let component: TypeDateRangeComponent;
    let fixture: ComponentFixture<TypeDateRangeComponent>;
    const data: NaturalDropdownData = {
        condition: null,
        configuration: null,
    };

    const condition: FilterGroupConditionField = {
        between: {from: '2012-01-01', to: '2018-01-01'},
    };

    const conditionOnlyFrom: FilterGroupConditionField = {
        greaterOrEqual: {value: '2012-01-01'},
    };

    const conditionOnlyTo: FilterGroupConditionField = {
        lessOrEqual: {value: '2018-01-01'},
    };

    const config: TypeDateRangeConfiguration<Date> = {};

    const configWithRules: TypeDateRangeConfiguration<Date> = {
        min: new Date('2001-01-01'),
        max: new Date('2010-01-01'),
        fromRequired: true,
    };

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [TypeDateRangeComponent],
            imports: [
                NoopAnimationsModule,
                FormsModule,
                ReactiveFormsModule,
                MatFormFieldModule,
                MatInputModule,
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
            ],
        }).compileComponents();
    }));

    function createComponent(c: FilterGroupConditionField | null, configuration: TypeDateRangeConfiguration<Date> | null) {
        data.condition = c;
        data.configuration = configuration;
        TestBed.overrideProvider(NATURAL_DROPDOWN_DATA, {useValue: data});
        fixture = TestBed.createComponent<TypeDateRangeComponent>(TypeDateRangeComponent);
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

        createComponent(condition, config);
        expect(component.getCondition()).toEqual(condition);

        createComponent(condition, configWithRules);
        expect(component.getCondition()).toEqual(condition);

        createComponent(conditionOnlyFrom, configWithRules);
        expect(component.getCondition()).toEqual(conditionOnlyFrom);

        createComponent(conditionOnlyTo, configWithRules);
        expect(component.getCondition()).toEqual(conditionOnlyTo);
    });

    it('should rendered value as string', () => {
        createComponent(null, null);
        expect(component.renderedValue.value).toBe('');

        createComponent(condition, config);
        expect(component.renderedValue.value).toBe('01/01/2012 - 01/01/2018');

        createComponent(condition, configWithRules);
        expect(component.renderedValue.value).toBe('01/01/2012 - 01/01/2018');

        createComponent(conditionOnlyFrom, configWithRules);
        expect(component.renderedValue.value).toBe('≥ 01/01/2012');

        createComponent(conditionOnlyTo, configWithRules);
        expect(component.renderedValue.value).toBe('≤ 01/01/2018');
    });

    it('should validate according to rules', () => {
        createComponent(null, null);
        expect(component.isValid()).toBe(false);

        createComponent(condition, config);
        expect(component.isValid()).toBe(true);

        createComponent(condition, configWithRules);
        expect(component.isValid()).toBe(false);
    });
});
