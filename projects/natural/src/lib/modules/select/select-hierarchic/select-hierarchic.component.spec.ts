import {fakeAsync, TestBed} from '@angular/core/testing';
import {
    HierarchicDialogResult,
    NaturalHierarchicSelectorDialogComponent,
    NaturalHierarchicSelectorDialogService,
    naturalProviders,
    NaturalSelectHierarchicComponent,
    OrganizedModelSelection,
} from '@ecodev/natural';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {Component} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MockApolloProvider} from '../../../testing/mock-apollo.provider';
import {
    AbstractTestHostWithFormControlComponent,
    AbstractTestHostWithNgModelComponent,
    itemHierarchicConfig,
    TestFixture,
    testSelectAndSelectHierarchicCommonBehavior,
} from '../testing/utils';
import {By} from '@angular/platform-browser';
import {of} from 'rxjs';
import {MatDialogRef} from '@angular/material/dialog';
import {ItemService} from '../../../testing/item.service';

@Component({
    template: `
        <natural-select-hierarchic
            [config]="hierarchicConfig"
            [required]="required"
            [disabled]="disabled"
            (selectionChange)="onSelection($event)"
            (blur)="onBlur()"
            [(ngModel)]="myValue"
            placeholder="ngModel"
        ></natural-select-hierarchic>
    `,
    standalone: true,
    imports: [FormsModule, NaturalSelectHierarchicComponent],
})
class TestHostWithHierarchicAndNgModelComponent extends AbstractTestHostWithNgModelComponent {}

@Component({
    template: `
        <natural-select-hierarchic
            [config]="hierarchicConfig"
            (selectionChange)="onSelection($event)"
            (blur)="onBlur()"
            [formControl]="formControl"
            placeholder="formControl"
        ></natural-select-hierarchic>
    `,
    standalone: true,
    imports: [ReactiveFormsModule, NaturalSelectHierarchicComponent],
})
class TestHostWithHierarchicAndFormControlComponent extends AbstractTestHostWithFormControlComponent {}

describe('NaturalSelectHierarchicComponent', () => {
    const data: TestFixture<NaturalSelectHierarchicComponent> = {
        hostComponent: null as any,
        selectComponent: null as any,
        fixture: null as any,
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [NoopAnimationsModule],
            providers: [naturalProviders, MockApolloProvider],
        }).compileComponents();
    });

    describe('with ngModel', () => {
        beforeEach(() => {
            data.fixture = TestBed.createComponent(TestHostWithHierarchicAndNgModelComponent);
            data.hostComponent = data.fixture.componentInstance;
            data.selectComponent = data.fixture.debugElement.query(
                By.directive(NaturalSelectHierarchicComponent),
            ).context;
            data.fixture.detectChanges();
        });

        testSelectAndSelectHierarchicCommonBehavior(data);
        testSelectHierarchicBehavior(data);
    });

    describe('with formControl', () => {
        beforeEach(() => {
            data.fixture = TestBed.createComponent(TestHostWithHierarchicAndFormControlComponent);
            data.hostComponent = data.fixture.componentInstance;
            data.selectComponent = data.fixture.debugElement.query(
                By.directive(NaturalSelectHierarchicComponent),
            ).context;
            data.fixture.detectChanges();
        });

        testSelectAndSelectHierarchicCommonBehavior(data);
        testSelectHierarchicBehavior(data);
    });
});

function mockDialogRef(
    selection: OrganizedModelSelection | undefined,
): MatDialogRef<NaturalHierarchicSelectorDialogComponent, HierarchicDialogResult> {
    const fakeSelection: HierarchicDialogResult = {
        hierarchicSelection: selection,
        searchSelections: [],
    };

    return {
        afterClosed: () => of(fakeSelection),
    } as unknown as MatDialogRef<NaturalHierarchicSelectorDialogComponent, HierarchicDialogResult>;
}

function testSelectHierarchicBehavior(data: TestFixture<NaturalSelectHierarchicComponent>): void {
    it(`should be able to open dialog, select item, validate, re-open dialog, **see** previous selection, validate`, fakeAsync(() => {
        const hierarchicSelectorDialogService = TestBed.inject(NaturalHierarchicSelectorDialogService);
        const itemService = TestBed.inject(ItemService);
        const item = itemService.getItem();

        const spy = spyOn(hierarchicSelectorDialogService, 'open');

        // Mock first selection of an item coming from service
        spy.withArgs(
            {
                hierarchicConfig: data.selectComponent.config!,
                hierarchicSelection: {},
                hierarchicFilters: undefined,
                multiple: false,
            },
            {restoreFocus: false},
        ).and.callFake(() => mockDialogRef({any: [item]}));

        // Mock second selection of the item that is already selected, so it simulates
        // a human who opens the dialog and closes it immediately with "Valider" button
        spy.withArgs(
            {
                hierarchicConfig: data.selectComponent.config!,
                hierarchicSelection: {any: [item]},
                hierarchicFilters: undefined,
                multiple: false,
            },
            {restoreFocus: false},
        ).and.callFake(hierarchicConfig => mockDialogRef(hierarchicConfig.hierarchicSelection));

        // Trigger the selection of item in mocked dialog
        data.selectComponent.openDialog();

        const value = data.hostComponent.getValue();
        expect(value).toEqual(item);

        // Trigger the re-selection in mocked dialog
        data.selectComponent.openDialog();

        const valueAfterReSelection = data.hostComponent.getValue();
        expect(valueAfterReSelection).toEqual(item);

        expect(spy).toHaveBeenCalledTimes(2);
    }));

    it('should never open with `null` config', fakeAsync(() => {
        const hierarchicSelectorDialogService = TestBed.inject(NaturalHierarchicSelectorDialogService);

        const spy = spyOn(hierarchicSelectorDialogService, 'open').and.callFake(hierarchicConfig =>
            mockDialogRef(hierarchicConfig.hierarchicSelection),
        );

        data.selectComponent.config = null;
        data.selectComponent.selectLabel = 'test select label';

        // Trigger the selection of item in mocked dialog
        data.selectComponent.openDialog();

        expect(spy).not.toHaveBeenCalled();
        expect(data.selectComponent.showSelectButton()).toBeFalse();

        data.selectComponent.config = itemHierarchicConfig;

        // Now that we have confiuration, trigger the selection of item again
        data.selectComponent.openDialog();

        expect(spy).toHaveBeenCalledOnceWith(
            {
                hierarchicConfig: itemHierarchicConfig,
                hierarchicSelection: {},
                hierarchicFilters: undefined,
                multiple: false,
            },
            {restoreFocus: false},
        );
        expect(data.selectComponent.showSelectButton()).toBeTrue();
    }));

    it('should never open with empty array config', fakeAsync(() => {
        const hierarchicSelectorDialogService = TestBed.inject(NaturalHierarchicSelectorDialogService);

        const spy = spyOn(hierarchicSelectorDialogService, 'open');

        data.selectComponent.config = [];
        data.selectComponent.selectLabel = 'test select label';

        // Trigger the selection of item in mocked dialog
        data.selectComponent.openDialog();

        expect(spy).not.toHaveBeenCalled();
        expect(data.selectComponent.showSelectButton()).toBeFalse();
    }));

    it('should never open with non-empty array but without `selectableAtKey` config', fakeAsync(() => {
        const hierarchicSelectorDialogService = TestBed.inject(NaturalHierarchicSelectorDialogService);

        const spy = spyOn(hierarchicSelectorDialogService, 'open');

        data.selectComponent.config = [{service: ItemService}];
        data.selectComponent.selectLabel = 'test select label';

        // Trigger the selection of item in mocked dialog
        data.selectComponent.openDialog();

        expect(spy).not.toHaveBeenCalled();
        expect(data.selectComponent.showSelectButton()).toBeFalse();
    }));
}
