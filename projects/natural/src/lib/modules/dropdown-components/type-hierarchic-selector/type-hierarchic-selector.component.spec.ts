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

function createComponent(
    fixture: TestFixture<TypeHierarchicSelectorComponent, TypeHierarchicSelectorConfiguration>,
    condition: FilterGroupConditionField | null,
    configuration: TypeHierarchicSelectorConfiguration,
): void {
    fixture.data.condition = condition;
    fixture.data.configuration = configuration;

    TestBed.overrideProvider(NATURAL_DROPDOWN_DATA, {useValue: fixture.data});

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
        defaultConfiguration: null as any,
    };

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [TypeHierarchicSelectorComponent],
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
                key: 'any',
                service: service,
                config: [
                    {
                        service: AnyService,
                        parentsRelationNames: ['parent'],
                        childrenRelationNames: ['parent'],
                        selectableAtKey: 'any',
                    },
                ],
            };
        }),
    );

    testAssociationSelect(fixture, createComponent);
});
