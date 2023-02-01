import {CommonModule} from '@angular/common';
import {TestBed, tick} from '@angular/core/testing';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FilterGroupConditionField, TypeNaturalSelectComponent, TypeSelectNaturalConfiguration} from '@ecodev/natural';
import {NATURAL_DROPDOWN_DATA} from '../../search/dropdown-container/dropdown.service';
import {ItemService} from '../../../testing/item.service';
import {MatFormFieldModule} from '@angular/material/form-field';
import {testAssociationSelect, TestFixture} from '../testing/utils';
import {ApolloModule} from 'apollo-angular';

function createComponent(
    fixture: TestFixture<TypeNaturalSelectComponent<ItemService>, TypeSelectNaturalConfiguration<ItemService>>,
    condition: FilterGroupConditionField | null,
): void {
    const configuration: TypeSelectNaturalConfiguration<ItemService> = {
        service: null as any, // This will be completed as soon as we finished configuring our TestBed
        placeholder: 'My placeholder',
    };
    fixture.data.condition = condition;
    fixture.data.configuration = configuration;

    TestBed.overrideProvider(NATURAL_DROPDOWN_DATA, {useValue: fixture.data});

    configuration.service = TestBed.inject(ItemService);

    fixture.component =
        TestBed.createComponent<TypeNaturalSelectComponent<ItemService>>(TypeNaturalSelectComponent).componentInstance;

    tick(5000);
}

describe('TypeNaturalSelectComponent', () => {
    const fixture: TestFixture<TypeNaturalSelectComponent<ItemService>, TypeSelectNaturalConfiguration<ItemService>> = {
        component: null as any,
        data: {
            condition: null,
            configuration: null as any,
        },
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [TypeNaturalSelectComponent],
            imports: [CommonModule, FormsModule, ReactiveFormsModule, MatFormFieldModule, ApolloModule],
            providers: [
                {
                    provide: NATURAL_DROPDOWN_DATA,
                    useValue: fixture.data,
                },
            ],
        }).compileComponents();
    });

    testAssociationSelect(fixture, createComponent);
});
