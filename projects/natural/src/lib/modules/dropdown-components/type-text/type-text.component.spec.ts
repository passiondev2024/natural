import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {
    FilterGroupConditionField,
    NATURAL_DROPDOWN_DATA,
    NaturalDropdownData,
    NaturalDropdownRef,
} from '@ecodev/natural';
import {TypeTextComponent} from './type-text.component';
import '@angular/localize/init';

describe('TypeTextComponent', () => {
    let component: TypeTextComponent;
    let fixture: ComponentFixture<TypeTextComponent>;
    let dialogCloseSpy: jasmine.Spy;
    const data: NaturalDropdownData = {
        condition: null,
        configuration: null,
    };

    const condition: FilterGroupConditionField = {
        like: {value: '123'},
    };

    beforeEach(async(() => {
        const dialogRef = {close: () => true};
        dialogCloseSpy = spyOn(dialogRef, 'close');

        TestBed.configureTestingModule({
            declarations: [TypeTextComponent],
            imports: [NoopAnimationsModule, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule],
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

    function createComponent(c: FilterGroupConditionField | null): void {
        data.condition = c;
        TestBed.overrideProvider(NATURAL_DROPDOWN_DATA, {useValue: data});
        fixture = TestBed.createComponent<TypeTextComponent>(TypeTextComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }

    it('should create', () => {
        createComponent(null);
        expect(component).toBeTruthy();
    });

    it('should get condition', () => {
        const empty: any = {
            like: {value: null},
        };

        const notEmpty: FilterGroupConditionField = {
            like: {value: '123'},
        };

        createComponent(null);
        expect(component.getCondition()).toEqual(empty);

        createComponent(condition);
        expect(component.getCondition()).toEqual(notEmpty);

        createComponent(condition);
        expect(component.getCondition()).toEqual(notEmpty);
    });

    it('should rendered value as string', () => {
        createComponent(null);
        expect(component.renderedValue.value).toBe('');

        createComponent(condition);
        expect(component.renderedValue.value).toBe('123');
    });

    it('should close', () => {
        createComponent(null);
        component.close();
        expect(dialogCloseSpy).toHaveBeenCalled();
    });
});
