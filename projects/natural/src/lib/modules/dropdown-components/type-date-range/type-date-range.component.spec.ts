import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MAT_DATE_LOCALE, MatNativeDateModule} from '@angular/material/core';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {
    FilterGroupConditionField,
    NATURAL_DROPDOWN_DATA,
    NaturalDropdownData,
    TypeDateRangeComponent,
    TypeDateRangeConfiguration,
} from '@ecodev/natural';

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
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NoopAnimationsModule, MatNativeDateModule],
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
    });

    function createComponent(
        c: FilterGroupConditionField | null,
        configuration: TypeDateRangeConfiguration<Date> | null,
    ): void {
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

    it('should get empty condition with config', () => {
        const empty: FilterGroupConditionField = {};

        createComponent(null, null);
        expect(component.getCondition()).toEqual(empty);
    });

    it('should get condition with config', () => {
        createComponent(condition, config);
        expect(component.getCondition()).toEqual(condition);
    });

    it('should get condition with config with rules', () => {
        createComponent(condition, configWithRules);
        expect(component.getCondition()).toEqual(condition);
    });

    it('should get empty condition with config with rules if `to` is missing', () => {
        createComponent(conditionOnlyFrom, configWithRules);
        expect(component.getCondition()).toEqual({});
    });

    it('should get empty condition with config with rules if `from` is missing', () => {
        createComponent(conditionOnlyTo, configWithRules);
        expect(component.getCondition()).toEqual({});
    });

    it('should render `null` as empty string', () => {
        createComponent(null, null);
        expect(component.renderedValue.value).toBe('');
    });

    it('should render value as string', () => {
        createComponent(condition, config);
        expect(component.renderedValue.value).toBe('01/01/2012 - 01/01/2018');
    });

    it('should render value as string with config with rules', () => {
        createComponent(condition, configWithRules);
        expect(component.renderedValue.value).toBe('01/01/2012 - 01/01/2018');
    });

    it('should render value with missing `to` as empty string', () => {
        createComponent(conditionOnlyFrom, configWithRules);
        expect(component.renderedValue.value).toBe('');
    });

    it('should render value with missing `from` as empty string', () => {
        createComponent(conditionOnlyTo, configWithRules);
        expect(component.renderedValue.value).toBe('');
    });

    it('should not validate without value', () => {
        createComponent(null, null);
        expect(component.isValid()).toBe(false);
    });

    it('should validate with value but without rules', () => {
        createComponent(condition, config);
        expect(component.isValid()).toBe(true);
    });

    it('should not validate with value missing `to`', () => {
        createComponent(conditionOnlyFrom, config);
        expect(component.isValid()).toBe(false);
    });

    it('should not validate with value missing `from`', () => {
        createComponent(conditionOnlyTo, config);
        expect(component.isValid()).toBe(false);
    });

    it('should not validate with value with rules', () => {
        createComponent(condition, configWithRules);
        expect(component.isValid()).toBe(false);
    });
});
