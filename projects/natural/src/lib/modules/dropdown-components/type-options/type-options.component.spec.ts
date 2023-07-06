import {ComponentFixture, TestBed} from '@angular/core/testing';
import {FilterGroupConditionField, NaturalDropdownRef} from '@ecodev/natural';
import {NATURAL_DROPDOWN_DATA, NaturalDropdownData} from '../../search/dropdown-container/dropdown.service';
import {TypeOptionsComponent, TypeOptionsConfiguration} from './type-options.component';

describe('TypeOptionsComponent', () => {
    let component: TypeOptionsComponent;
    let fixture: ComponentFixture<TypeOptionsComponent>;
    const data: NaturalDropdownData = {
        condition: null,
        configuration: null,
    };

    const conditionIs: FilterGroupConditionField = {equal: {value: true}};
    const conditionIsNot: FilterGroupConditionField = {equal: {value: false}};
    const conditionIsNull: FilterGroupConditionField = {null: {not: false}};
    const conditionIsNotNull: FilterGroupConditionField = {null: {not: true}};

    const defaultConfiguration = {
        options: [
            {
                display: 'Is active',
                condition: conditionIs,
            },
            {
                display: 'Is inactive',
                condition: conditionIsNot,
            },
            {
                display: 'Is defined',
                condition: conditionIsNotNull,
            },
            {
                display: 'Is not defined',
                condition: conditionIsNull,
            },
        ],
    };

    beforeEach(async () => {
        const dialogRef = {close: () => true};

        await TestBed.configureTestingModule({
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

    function createComponent(
        c: FilterGroupConditionField | null,
        configuration: TypeOptionsConfiguration | null = defaultConfiguration,
    ): void {
        data.condition = c;
        data.configuration = configuration;
        TestBed.overrideProvider(NATURAL_DROPDOWN_DATA, {useValue: data});
        fixture = TestBed.createComponent<TypeOptionsComponent>(TypeOptionsComponent);
        component = fixture.componentInstance;
    }

    it('should create', () => {
        createComponent(conditionIs);
        expect(component).toBeTruthy();
    });

    it('should get `is` condition', () => {
        createComponent(conditionIs);
        expect(component.getCondition()).toEqual(conditionIs);
    });

    it('should get `isNot` condition', () => {
        createComponent(conditionIsNot);
        expect(component.getCondition()).toEqual(conditionIsNot);
    });

    it('should get `any` condition', () => {
        createComponent(conditionIsNull);
        expect(component.getCondition()).toEqual(conditionIsNull);
    });

    it('should get `none` condition', () => {
        createComponent(conditionIsNotNull);
        expect(component.getCondition()).toEqual(conditionIsNotNull);
    });

    it('should rendered `Is Active` value', () => {
        createComponent(conditionIs);
        expect(component.renderedValue.value).toBe('Is active');
    });

    it('should rendered `Is inactive` value', () => {
        createComponent(conditionIsNot);
        expect(component.renderedValue.value).toBe('Is inactive');
    });

    it('should rendered `Is defined` value', () => {
        createComponent(conditionIsNotNull);
        expect(component.renderedValue.value).toBe('Is defined');
    });

    it('should rendered `Is not defined` value', () => {
        createComponent(conditionIsNull);
        expect(component.renderedValue.value).toBe('Is not defined');
    });

    it('should validate if at least one selection', () => {
        createComponent(null, defaultConfiguration);
        expect(component.isValid()).toBe(false);

        component.formControl.setValue(defaultConfiguration.options[0]);
        expect(component.isValid()).toBe(true);
    });
});
