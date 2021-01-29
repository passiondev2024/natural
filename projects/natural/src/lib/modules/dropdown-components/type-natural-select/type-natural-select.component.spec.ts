import {CommonModule} from '@angular/common';
import {TestBed, tick, waitForAsync} from '@angular/core/testing';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FilterGroupConditionField, TypeNaturalSelectComponent, TypeSelectNaturalConfiguration} from '@ecodev/natural';
import {NATURAL_DROPDOWN_DATA} from '../../search/dropdown-container/dropdown.service';
import {AnyService} from '../../../testing/any.service';
import {MatFormFieldModule} from '@angular/material/form-field';
import {testAssociationSelect, TestFixture} from '../testing/utils';

function createComponent(
    fixture: TestFixture<TypeNaturalSelectComponent<AnyService>, TypeSelectNaturalConfiguration<AnyService>>,
    condition: FilterGroupConditionField | null,
    configuration: TypeSelectNaturalConfiguration<AnyService>,
): void {
    fixture.data.condition = condition;
    fixture.data.configuration = configuration;

    TestBed.overrideProvider(NATURAL_DROPDOWN_DATA, {useValue: fixture.data});

    fixture.component = TestBed.createComponent<TypeNaturalSelectComponent<AnyService>>(
        TypeNaturalSelectComponent,
    ).componentInstance;

    tick(5000);
}

describe('TypeNaturalSelectComponent', () => {
    const fixture: TestFixture<TypeNaturalSelectComponent<AnyService>, TypeSelectNaturalConfiguration<AnyService>> = {
        component: null as any,
        data: {
            condition: null,
            configuration: null as any,
        },
        defaultConfiguration: null as any,
    };

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [TypeNaturalSelectComponent],
                imports: [CommonModule, FormsModule, ReactiveFormsModule, MatFormFieldModule],
                providers: [
                    {
                        provide: NATURAL_DROPDOWN_DATA,
                        useValue: fixture.data,
                    },
                ],
            }).compileComponents();

            const service = TestBed.inject(AnyService);
            fixture.defaultConfiguration = {
                service: service,
                placeholder: 'My placeholder',
            };
        }),
    );

    testAssociationSelect(fixture, createComponent);
});
