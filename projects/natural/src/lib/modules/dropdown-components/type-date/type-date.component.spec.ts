import {ComponentFixture, TestBed} from '@angular/core/testing';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {DateAdapter, MAT_DATE_LOCALE, MatNativeDateModule, NativeDateAdapter} from '@angular/material/core';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatLegacyFormFieldModule as MatFormFieldModule} from '@angular/material/legacy-form-field';
import {MatLegacyInputModule as MatInputModule} from '@angular/material/legacy-input';
import {MatLegacySelectModule as MatSelectModule} from '@angular/material/legacy-select';
import {MatLegacyCheckboxModule as MatCheckboxModule} from '@angular/material/legacy-checkbox';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {
    FilterGroupConditionField,
    NATURAL_DROPDOWN_DATA,
    NaturalDropdownData,
    TypeDateComponent,
    TypeDateConfiguration,
} from '@ecodev/natural';
import {Injectable} from '@angular/core';

@Injectable()
class ImpossibleParsingDateAdapter extends NativeDateAdapter {
    public override parse(): Date | null {
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

    const conditionGreaterOrEqualToday: FilterGroupConditionField = {
        greaterOrEqual: {value: 'today'},
    };

    const conditionLessOrEqualToday: FilterGroupConditionField = {
        lessOrEqual: {value: 'today'},
    };

    const conditionGreaterToday: FilterGroupConditionField = {
        greater: {value: 'today'},
    };

    const conditionLessToday: FilterGroupConditionField = {
        less: {value: 'today'},
    };

    const conditionEqualToday: FilterGroupConditionField = {
        greaterOrEqual: {value: 'today'},
        less: {value: 'tomorrow'},
    };

    const conditionInvalidRangeEqualToday: FilterGroupConditionField = {
        greaterOrEqual: {value: 'today'},
        less: {value: '2019-09-09'}, // the date will be transparently fixed into "tomorrow"
    };

    const config: TypeDateConfiguration<Date> = {};

    const configWithRules: TypeDateConfiguration<Date> = {
        min: new Date('2001-01-01'),
        max: new Date('2010-01-01'),
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
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
                MatCheckboxModule,
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
    });

    function createComponent(
        c: FilterGroupConditionField | null,
        configuration: TypeDateConfiguration<Date> | null,
    ): void {
        data.condition = c;
        data.configuration = configuration;
        TestBed.overrideProvider(NATURAL_DROPDOWN_DATA, {useValue: data});
        fixture = TestBed.createComponent<TypeDateComponent>(TypeDateComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }

    it('should create', () => {
        createComponent(null, null);
        expect(component.todayCtrl.value).toBeFalse();
        expect(component.valueCtrl.enabled).toBeTrue();
        expect(component).toBeTruthy();
    });

    it('should get empty condition without config', () => {
        const empty: FilterGroupConditionField = {};

        createComponent(null, null);
        expect(component.todayCtrl.value).toBeFalse();
        expect(component.valueCtrl.enabled).toBeTrue();
        expect(component.getCondition()).toEqual(empty);
    });

    it('should get `greaterOrEqual` condition with config', () => {
        createComponent(conditionGreaterOrEqual, config);
        expect(component.todayCtrl.value).toBeFalse();
        expect(component.valueCtrl.enabled).toBeTrue();
        expect(component.getCondition()).toEqual(conditionGreaterOrEqual);
    });

    it('should get `greaterOrEqual` condition with config with rules', () => {
        createComponent(conditionGreaterOrEqual, configWithRules);
        expect(component.todayCtrl.value).toBeFalse();
        expect(component.valueCtrl.enabled).toBeTrue();
        expect(component.getCondition()).toEqual(conditionGreaterOrEqual);
    });

    it('should get condition with config with rules and automatically change to greaterOrEqual', () => {
        createComponent(conditionGreater, configWithRules);
        expect(component.todayCtrl.value).toBeFalse();
        expect(component.valueCtrl.enabled).toBeTrue();
        expect(component.getCondition()).toEqual({
            greaterOrEqual: {value: '2012-01-06'},
        });
    });

    it('should get `less` condition with config with rules', () => {
        createComponent(conditionLessOrEqual, configWithRules);
        expect(component.todayCtrl.value).toBeFalse();
        expect(component.valueCtrl.enabled).toBeTrue();
        expect(component.getCondition())
            .withContext('should automatically change to less')
            .toEqual({
                less: {value: '2018-01-06'},
            });
    });

    it('should get `less` condition with config with rules', () => {
        createComponent(conditionLess, configWithRules);
        expect(component.todayCtrl.value).toBeFalse();
        expect(component.valueCtrl.enabled).toBeTrue();
        expect(component.getCondition()).toEqual(conditionLess);
    });

    it('should get `equal` condition with config with rules', () => {
        createComponent(conditionEqual, configWithRules);
        expect(component.todayCtrl.value).toBeFalse();
        expect(component.valueCtrl.enabled).toBeTrue();
        expect(component.getCondition()).toEqual(conditionEqual);
    });

    it('should get `equal` condition with config with rules because it transparently accept invalid range and fix it', () => {
        createComponent(conditionInvalidRangeEqual, configWithRules);
        expect(component.todayCtrl.value).toBeFalse();
        expect(component.valueCtrl.enabled).toBeTrue();
        expect(component.getCondition()).toEqual(conditionEqual);
    });

    it('should render `null` as empty string', () => {
        createComponent(null, null);
        expect(component.todayCtrl.value).toBeFalse();
        expect(component.valueCtrl.enabled).toBeTrue();
        expect(component.renderedValue.value).toBe('');
    });

    it('should render `greaterOrEqual` value as string', () => {
        createComponent(conditionGreaterOrEqual, config);
        expect(component.todayCtrl.value).toBeFalse();
        expect(component.valueCtrl.enabled).toBeTrue();
        expect(component.renderedValue.value).toBe('≥ 05/01/2012');
    });

    it('should render `greaterOrEqual` value as string with config with rules', () => {
        createComponent(conditionGreaterOrEqual, configWithRules);
        expect(component.todayCtrl.value).toBeFalse();
        expect(component.valueCtrl.enabled).toBeTrue();
        expect(component.renderedValue.value).toBe('≥ 05/01/2012');
    });

    it('should render `greater` value as string', () => {
        createComponent(conditionGreater, configWithRules);
        expect(component.todayCtrl.value).toBeFalse();
        expect(component.valueCtrl.enabled).toBeTrue();
        expect(component.renderedValue.value).toBe('> 05/01/2012');
    });

    it('should render `lessOrEqual` value as string', () => {
        createComponent(conditionLessOrEqual, configWithRules);
        expect(component.todayCtrl.value).toBeFalse();
        expect(component.valueCtrl.enabled).toBeTrue();
        expect(component.renderedValue.value).toBe('≤ 05/01/2018');
    });

    it('should render `less` value as string', () => {
        createComponent(conditionLess, configWithRules);
        expect(component.todayCtrl.value).toBeFalse();
        expect(component.valueCtrl.enabled).toBeTrue();
        expect(component.renderedValue.value).toBe('< 05/01/2018');
    });

    it('should render `equal` value as string', () => {
        createComponent(conditionEqual, configWithRules);
        expect(component.todayCtrl.value).toBeFalse();
        expect(component.valueCtrl.enabled).toBeTrue();
        expect(component.renderedValue.value).toBe('= 05/01/2018');
    });

    it('should not validate without value', () => {
        createComponent(null, null);
        expect(component.todayCtrl.value).toBeFalse();
        expect(component.valueCtrl.enabled).toBeTrue();
        expect(component.isValid()).toBe(false);
    });

    it('should validate with value but without rules', () => {
        createComponent(conditionGreaterOrEqual, config);
        expect(component.todayCtrl.value).toBeFalse();
        expect(component.valueCtrl.enabled).toBeTrue();
        expect(component.isValid()).toBe(true);
    });

    it('should not validate with value with rules', () => {
        createComponent(conditionGreaterOrEqual, configWithRules);
        expect(component.todayCtrl.value).toBeFalse();
        expect(component.valueCtrl.enabled).toBeTrue();
        expect(component.isValid()).toBe(false);
    });

    describe('supports special "today" value', () => {
        it('should get `lessOrEqual` condition', () => {
            createComponent(conditionLessOrEqualToday, config);
            expect(component.todayCtrl.value).toBeTrue();
            expect(component.valueCtrl.enabled).toBeFalse();
            expect(component.getCondition())
                .withContext(
                    'should *not* automatically change to `less` because we would not be able to reload a consistent GUI with those values',
                )
                .toEqual(conditionLessOrEqualToday);
        });

        it('should get `great` condition', () => {
            createComponent(conditionGreaterToday, config);
            expect(component.todayCtrl.value).toBeTrue();
            expect(component.valueCtrl.enabled).toBeFalse();
            expect(component.getCondition())
                .withContext(
                    'should *not* automatically change to `greaterOrEqual` because we would not be able to reload a consistent GUI with those values',
                )
                .toEqual(conditionGreaterToday);
        });

        it('should get `less` condition', () => {
            createComponent(conditionLessToday, config);
            expect(component.todayCtrl.value).toBeTrue();
            expect(component.valueCtrl.enabled).toBeFalse();
            expect(component.getCondition()).toEqual(conditionLessToday);
        });

        it('should get `equal` condition', () => {
            createComponent(conditionEqualToday, config);
            expect(component.todayCtrl.value).toBeTrue();
            expect(component.valueCtrl.enabled).toBeFalse();
            expect(component.getCondition()).toEqual(conditionEqualToday);
        });

        it('should get `equal` condition because it transparently accept invalid range and fix it', () => {
            createComponent(conditionInvalidRangeEqualToday, config);
            expect(component.todayCtrl.value).toBeTrue();
            expect(component.valueCtrl.enabled).toBeFalse();
            expect(component.getCondition()).toEqual(conditionEqualToday);
        });

        it('should get `greaterOrEqual` condition', () => {
            createComponent(conditionGreaterOrEqualToday, config);
            expect(component.todayCtrl.value).toBeTrue();
            expect(component.valueCtrl.enabled).toBeFalse();
            expect(component.getCondition()).toEqual(conditionGreaterOrEqualToday);
        });

        it('should render `equal` for as string', () => {
            createComponent(conditionEqualToday, config);
            expect(component.todayCtrl.value).toBeTrue();
            expect(component.valueCtrl.enabled).toBeFalse();
            expect(component.renderedValue.value).toBe("= Aujourd'hui");
        });

        it('should render `greaterOrEqual` value as string', () => {
            createComponent(conditionGreaterOrEqualToday, config);
            expect(component.todayCtrl.value).toBeTrue();
            expect(component.valueCtrl.enabled).toBeFalse();
            expect(component.renderedValue.value).toBe("≥ Aujourd'hui");
        });

        it('should render `lessOrEqual` value as string', () => {
            createComponent(conditionLessOrEqualToday, config);
            expect(component.todayCtrl.value).toBeTrue();
            expect(component.valueCtrl.enabled).toBeFalse();
            expect(component.renderedValue.value).toBe("≤ Aujourd'hui");
        });

        it('should render `less` value as string', () => {
            createComponent(conditionLessToday, config);
            expect(component.todayCtrl.value).toBeTrue();
            expect(component.valueCtrl.enabled).toBeFalse();
            expect(component.renderedValue.value).toBe("< Aujourd'hui");
        });

        it('should render `greater` value as string', () => {
            createComponent(conditionGreaterToday, config);
            expect(component.todayCtrl.value).toBeTrue();
            expect(component.valueCtrl.enabled).toBeFalse();
            expect(component.renderedValue.value).toBe("> Aujourd'hui");
        });
    });
});
