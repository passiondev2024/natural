import {ComponentFixture, TestBed} from '@angular/core/testing';
import {FilterGroupConditionField, NaturalDropdownRef} from '@ecodev/natural';
import {NATURAL_DROPDOWN_DATA, NaturalDropdownData} from '../../search/dropdown-container/dropdown.service';
import {TypeBooleanComponent} from './type-boolean.component';

fdescribe('TypeBooleanComponent', () => {
    let component: TypeBooleanComponent;
    let fixture: ComponentFixture<TypeBooleanComponent>;
    const data: NaturalDropdownData = {
        condition: null,
        configuration: null,
    };

    const conditionIs: FilterGroupConditionField = {equal: {value: true}};
    const conditionIsNot: FilterGroupConditionField = {equal: {value: false}};

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

    function createComponent(c: FilterGroupConditionField | null): void {
        data.condition = c;
        data.configuration = {
            displayWhenActive: 'Is active',
            displayWhenInactive: 'Is inactive',
        };
        TestBed.overrideProvider(NATURAL_DROPDOWN_DATA, {useValue: data});
        fixture = TestBed.createComponent<TypeBooleanComponent>(TypeBooleanComponent);
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

    it('should rendered `Is Active` value', () => {
        createComponent(conditionIs);
        expect(component.renderedValue.value).toBe('Is active');
    });

    it('should rendered `Is inactive` value', () => {
        createComponent(conditionIsNot);
        expect(component.renderedValue.value).toBe('Is inactive');
    });
});
