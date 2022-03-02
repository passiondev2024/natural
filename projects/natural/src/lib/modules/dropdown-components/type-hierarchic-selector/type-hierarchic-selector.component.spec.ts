import {CommonModule} from '@angular/common';
import {TestBed, tick, waitForAsync} from '@angular/core/testing';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {
    FilterGroupConditionField,
    TypeHierarchicSelectorComponent,
    TypeHierarchicSelectorConfiguration,
} from '@ecodev/natural';

import {NATURAL_DROPDOWN_DATA} from '../../search/dropdown-container/dropdown.service';
import {AnyService} from '../../../testing/any.service';
import {MatFormFieldModule} from '@angular/material/form-field';
import {testAssociationSelect, TestFixture} from '../testing/utils';
import {ApolloModule} from 'apollo-angular';

function createComponent(
    fixture: TestFixture<TypeHierarchicSelectorComponent, TypeHierarchicSelectorConfiguration>,
    condition: FilterGroupConditionField | null,
): void {
    const configuration: TypeHierarchicSelectorConfiguration = {
        key: 'any',
        service: null as any, // This will be completed as soon as we finished configuring our TestBed
        config: [
            {
                service: AnyService,
                parentsRelationNames: ['parent'],
                childrenRelationNames: ['parent'],
                selectableAtKey: 'any',
            },
        ],
    };
    fixture.data.condition = condition;
    fixture.data.configuration = configuration;

    TestBed.overrideProvider(NATURAL_DROPDOWN_DATA, {useValue: fixture.data});

    configuration.service = TestBed.inject(AnyService);

    fixture.component = TestBed.createComponent<TypeHierarchicSelectorComponent>(
        TypeHierarchicSelectorComponent,
    ).componentInstance;

    tick(5000);
}

describe('TypeHierarchicSelectorComponent', () => {
    const fixture: TestFixture<TypeHierarchicSelectorComponent, TypeHierarchicSelectorConfiguration> = {
        component: null as any,
        data: {
            condition: null,
            configuration: null as any,
        },
    };

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [TypeHierarchicSelectorComponent],
                imports: [CommonModule, FormsModule, ReactiveFormsModule, MatFormFieldModule, ApolloModule],
                providers: [
                    {
                        provide: NATURAL_DROPDOWN_DATA,
                        useValue: fixture.data,
                    },
                ],
            }).compileComponents();
        }),
    );

    testAssociationSelect(fixture, createComponent);
});
