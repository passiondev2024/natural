import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatLegacyFormFieldModule as MatFormFieldModule} from '@angular/material/legacy-form-field';
import {MatLegacyInputModule as MatInputModule} from '@angular/material/legacy-input';
import {MatLegacySelectModule as MatSelectModule} from '@angular/material/legacy-select';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {
    FilterGroupConditionField,
    NATURAL_DROPDOWN_DATA,
    NaturalDropdownData,
    NaturalDropdownRef,
    TypeNumberComponent,
    TypeNumberConfiguration,
} from '@ecodev/natural';

describe('TypeNumberComponent', () => {
    let component: TypeNumberComponent;
    let fixture: ComponentFixture<TypeNumberComponent>;
    let dialogCloseSpy: jasmine.Spy;
    const data: NaturalDropdownData = {
        condition: null,
        configuration: null,
    };

    const condition: FilterGroupConditionField = {
        equal: {value: 123},
    };

    const conditionGreaterOrEqual: FilterGroupConditionField = {
        greaterOrEqual: {value: 456},
    };

    const config: TypeNumberConfiguration = {};

    const configWithRules: TypeNumberConfiguration = {
        min: 10,
        max: 20,
    };

    const decimalCondition: FilterGroupConditionField = {
        equal: {value: 0.123},
    };

    beforeEach(async () => {
        const dialogRef = {close: () => true};
        dialogCloseSpy = spyOn(dialogRef, 'close');

        await TestBed.configureTestingModule({
            declarations: [TypeNumberComponent],
            imports: [
                NoopAnimationsModule,
                FormsModule,
                ReactiveFormsModule,
                MatFormFieldModule,
                MatInputModule,
                MatSelectModule,
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
    });

    function createComponent(c: FilterGroupConditionField | null, configuration: TypeNumberConfiguration | null): void {
        data.condition = c;
        data.configuration = configuration;
        TestBed.overrideProvider(NATURAL_DROPDOWN_DATA, {useValue: data});
        fixture = TestBed.createComponent<TypeNumberComponent>(TypeNumberComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }

    it('should create', () => {
        createComponent(null, null);
        expect(component).toBeTruthy();
    });

    it('should get empty condition without config', () => {
        const empty: any = {
            equal: {value: null},
        };

        createComponent(null, null);
        expect(component.getCondition()).toEqual(empty);
    });

    it('should get non empty condition with config', () => {
        const notEmpty: FilterGroupConditionField = {
            equal: {value: 123},
        };

        createComponent(condition, config);
        expect(component.getCondition()).toEqual(notEmpty);
    });

    it('should get non empty condition with config with rules', () => {
        const notEmpty: FilterGroupConditionField = {
            equal: {value: 123},
        };

        createComponent(condition, configWithRules);
        expect(component.getCondition()).toEqual(notEmpty);
    });

    it('should render `null` as empty string', () => {
        createComponent(null, null);
        expect(component.renderedValue.value).toBe('');
    });

    it('should render `equal` value as string', () => {
        createComponent(condition, config);
        expect(component.renderedValue.value).toBe('= 123');
    });

    it('should render `equal` value as string with config with rules', () => {
        createComponent(condition, configWithRules);
        expect(component.renderedValue.value).toBe('= 123');
    });

    it('should render `greaterOrEqual` value as string', () => {
        createComponent(conditionGreaterOrEqual, configWithRules);
        expect(component.renderedValue.value).toBe('≥ 456');
    });

    it('should not validate without value', () => {
        createComponent(null, null);
        expect(component.isValid()).toBe(false);
    });

    it('should validate with value', () => {
        createComponent(condition, config);
        expect(component.isValid()).toBe(true);
    });

    it('should not validate according to rules', () => {
        createComponent(condition, configWithRules);
        expect(component.isValid()).toBe(false);
    });

    it('should validate according to empty rules', () => {
        createComponent(decimalCondition, {});
        expect(component.isValid()).toBe(true);
    });

    it('should validate according to step rule', () => {
        createComponent(decimalCondition, {step: 0.001});
        expect(component.isValid()).toBe(true);
    });

    it('should not validate according to step rule', () => {
        createComponent(decimalCondition, {step: 0.01});
        expect(component.isValid()).toBe(false);
    });

    it('should close', () => {
        createComponent(null, null);
        component.close();
        expect(dialogCloseSpy).toHaveBeenCalled();
    });
});
