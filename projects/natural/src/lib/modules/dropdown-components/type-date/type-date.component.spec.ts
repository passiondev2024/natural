import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import {
    DateAdapter,
    MAT_DATE_LOCALE,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
    MatSelectModule,
    NativeDateAdapter,
} from '@angular/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
    FilterGroupConditionField,
    NATURAL_DROPDOWN_DATA,
    NaturalDropdownData,
    TypeDateComponent,
    TypeDateConfiguration,
} from '@ecodev/natural';

class ImpossibleParsingDateAdapter extends NativeDateAdapter {
    public parse(value: any): Date | null {
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

    const condition: FilterGroupConditionField = {
        greaterOrEqual: {value: '2012-01-01'},
    };

    const conditionGreater: FilterGroupConditionField = {
        greater: {value: '2012-01-01'},
    };

    const conditionLessOrEqual: FilterGroupConditionField = {
        lessOrEqual: {value: '2018-01-01'},
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

        createComponent(condition, config);
        expect(component.getCondition()).toEqual(condition);

        createComponent(condition, configWithRules);
        expect(component.getCondition()).toEqual(condition);

        createComponent(conditionGreater, configWithRules);
        expect(component.getCondition()).toEqual(conditionGreater);

        createComponent(conditionLessOrEqual, configWithRules);
        expect(component.getCondition()).toEqual(conditionLessOrEqual);
    });

    it('should rendered value as string', () => {
        createComponent(null, null);
        expect(component.renderedValue.value).toBe('');

        createComponent(condition, config);
        expect(component.renderedValue.value).toBe('≥ 01/01/2012');

        createComponent(condition, configWithRules);
        expect(component.renderedValue.value).toBe('≥ 01/01/2012');

        createComponent(conditionGreater, configWithRules);
        expect(component.renderedValue.value).toBe('> 01/01/2012');

        createComponent(conditionLessOrEqual, configWithRules);
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
