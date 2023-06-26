import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {
    AvailableColumn,
    memorySessionStorageProvider,
    NaturalAbstractList,
    NaturalColumnsPickerModule,
    NaturalCommonModule,
    NaturalIconModule,
    NaturalPersistenceService,
} from '@ecodev/natural';
import {ItemService} from '../testing/item.service';
import {Component} from '@angular/core';
import {RouterTestingModule} from '@angular/router/testing';
import {MaterialModule} from '../../../../../src/app/material.module';
import {ActivatedRoute, Data} from '@angular/router';
import {ApolloModule} from 'apollo-angular';

@Component({
    template: ` <natural-columns-picker
        [availableColumns]="availableColumns"
        [selections]="selectedColumns"
        (selectionChange)="selectColumns($event)"
    >
    </natural-columns-picker>`,
})
class TestListComponent extends NaturalAbstractList<ItemService> {
    public override availableColumns: AvailableColumn[] = [
        {
            id: 'col1',
            label: 'column 1',
        },
        {
            id: 'col2',
            label: 'column 2',
            checked: false,
        },
        {
            id: 'col3',
            label: 'column 3',
        },
        {
            id: 'col4',
            label: 'column 4',
        },
        {
            id: 'hidden',
            label: 'hidden in menu',
            hidden: true,
        },
    ];

    public constructor(service: ItemService) {
        super(service);
    }

    protected override getStorageKey(): string {
        return 'test-key';
    }
}

describe('NaturalAbstractList', () => {
    let component: TestListComponent;
    let fixture: ComponentFixture<TestListComponent>;
    let persistSpy: jasmine.Spy<NaturalPersistenceService['persist']>;
    let getSpy: jasmine.Spy<NaturalPersistenceService['get']>;
    let persistenceService: NaturalPersistenceService;
    let mockedActivatedRoute: ActivatedRoute;

    function createComponent(data: Data): void {
        mockedActivatedRoute = {
            snapshot: {
                data: data,
                paramMap: new Map(),
            },
        } as any;

        TestBed.configureTestingModule({
            declarations: [TestListComponent],
            imports: [
                MaterialModule,
                NaturalCommonModule,
                NaturalIconModule.forRoot({}),
                NaturalColumnsPickerModule,
                RouterTestingModule,
                ApolloModule,
            ],
            providers: [
                {
                    provide: ActivatedRoute,
                    useValue: mockedActivatedRoute,
                },
                memorySessionStorageProvider,
            ],
        }).compileComponents();

        fixture = TestBed.createComponent<TestListComponent>(TestListComponent);
        persistenceService = TestBed.inject(NaturalPersistenceService);
        persistSpy = spyOn(persistenceService, 'persist');
        getSpy = spyOn(persistenceService, 'get');
        component = fixture.componentInstance;
    }

    function selectingDifferentColumnsWillPersistThem(defaultColumns: string[]): void {
        // Nothing has been persisted so far
        expect(persistSpy).not.toHaveBeenCalled();

        // Selecting exactly same columns will delete persistence
        component.selectedColumns = defaultColumns;
        fixture.detectChanges();
        tick(1000);

        expect(component.columnsForTable).toEqual(defaultColumns);
        expect(persistSpy).toHaveBeenCalledOnceWith('col', null, mockedActivatedRoute, 'test-key');

        // Selecting different columns will persist them
        component.selectedColumns = ['col1', 'col2'];
        fixture.detectChanges();
        tick(1000);

        expect(component.columnsForTable).toEqual(['col1', 'col2']);
        expect(persistSpy).toHaveBeenCalledWith('col', 'col1,col2', mockedActivatedRoute, 'test-key');
    }

    function selectingDifferentColumnsWillNotPersistThem(defaultColumns: string[]): void {
        // Nothing has been persisted so far
        expect(persistSpy).not.toHaveBeenCalled();

        // Selecting exactly same columns will not delete persistence
        component.selectedColumns = defaultColumns;
        fixture.detectChanges();
        tick(1000);

        expect(component.columnsForTable).toEqual(defaultColumns);
        expect(persistSpy).not.toHaveBeenCalled();

        // Selecting different columns will not persist them
        component.selectedColumns = ['col1', 'col2'];
        fixture.detectChanges();
        tick(1000);

        expect(component.columnsForTable).toEqual(['col1', 'col2']);
        expect(persistSpy).not.toHaveBeenCalled();
    }

    function mockColumnsInPersistence(): void {
        getSpy.and.callFake(key => (key === 'col' ? 'col2,col4' : null));
    }

    describe('without route data', () => {
        beforeEach(() => createComponent({}));
        it('should create', () => {
            expect(component).toBeTruthy();
        });

        describe('with persistSearch', () => {
            it('should select all columns except col2 which is unchecked by configuration', fakeAsync(() => {
                fixture.detectChanges();
                tick(1000);

                expect(component.columnsForTable).toEqual(['col1', 'col3', 'col4', 'hidden']);

                selectingDifferentColumnsWillPersistThem(['col1', 'col3', 'col4', 'hidden']);
            }));

            it('should select all valid selectedColumns', fakeAsync(() => {
                component.selectedColumns = ['col1', 'invalid-column'];
                fixture.detectChanges();
                tick(1000);

                expect(component.columnsForTable).toEqual(['col1']);

                selectingDifferentColumnsWillPersistThem(['col1']);
            }));

            it('should reload selection from persistence without @Input', fakeAsync(() => {
                mockColumnsInPersistence();
                fixture.detectChanges();
                tick(1000);

                expect(component.columnsForTable).toEqual(['col2', 'col4']);
            }));

            it('should reload selection from persistence even with @Input', fakeAsync(() => {
                mockColumnsInPersistence();
                component.selectedColumns = ['col1', 'invalid-column'];
                fixture.detectChanges();
                tick(1000);

                expect(component.columnsForTable).toEqual(['col2', 'col4']);
            }));

            it('should unselect all columns if becomes unavailable', fakeAsync(() => {
                fixture.detectChanges();
                tick(1000);

                expect(component.columnsForTable).toEqual(['col1', 'col3', 'col4', 'hidden']);

                component.availableColumns = [];
                fixture.detectChanges();
                tick(1000);

                expect(component.columnsForTable).toEqual([]);
            }));
        });

        describe('without persistSearch', () => {
            it('should select all columns except col2 which is unchecked by configuration', fakeAsync(() => {
                component.persistSearch = false;
                fixture.detectChanges();
                tick(1000);

                expect(component.columnsForTable).toEqual(['col1', 'col3', 'col4', 'hidden']);

                selectingDifferentColumnsWillNotPersistThem(['col1', 'col3', 'col4', 'hidden']);
            }));

            it('should select all valid selectedColumns', fakeAsync(() => {
                component.persistSearch = false;
                component.selectedColumns = ['col1', 'invalid-column'];
                fixture.detectChanges();
                tick(1000);

                expect(component.columnsForTable).toEqual(['col1']);

                selectingDifferentColumnsWillNotPersistThem(['col1']);
            }));

            it('should not reload selection from persistence without @Input', fakeAsync(() => {
                component.persistSearch = false;
                mockColumnsInPersistence();
                fixture.detectChanges();
                tick(1000);

                expect(component.columnsForTable).toEqual(['col1', 'col3', 'col4', 'hidden']);
            }));

            it('should not reload selection from persistence even with @Input', fakeAsync(() => {
                component.persistSearch = false;
                mockColumnsInPersistence();
                component.selectedColumns = ['col1', 'invalid-column'];
                fixture.detectChanges();
                tick(1000);

                expect(component.columnsForTable).toEqual(['col1']);
            }));
        });
    });

    describe('with route data for col3', () => {
        beforeEach(() => createComponent({selectedColumns: ['col3', 'invalid-column']}));

        it('should create', () => {
            expect(component).toBeTruthy();
        });

        describe('with persistSearch', () => {
            it('should select col3 via route data', fakeAsync(() => {
                fixture.detectChanges();
                tick(1000);

                expect(component.columnsForTable).toEqual(['col3']);

                selectingDifferentColumnsWillPersistThem(['col3']);
            }));

            it('should ignore direct @Input and select col3 via route data', fakeAsync(() => {
                component.selectedColumns = ['col1', 'invalid-column'];
                fixture.detectChanges();
                tick(1000);

                expect(component.columnsForTable).toEqual(['col3']);

                selectingDifferentColumnsWillPersistThem(['col3']);
            }));

            it('should reload selection from persistence without @Input', fakeAsync(() => {
                mockColumnsInPersistence();
                fixture.detectChanges();
                tick(1000);

                expect(component.columnsForTable).toEqual(['col2', 'col4']);
            }));

            it('should reload selection from persistence even with @Input', fakeAsync(() => {
                mockColumnsInPersistence();
                component.selectedColumns = ['col1', 'invalid-column'];
                fixture.detectChanges();
                tick(1000);

                expect(component.columnsForTable).toEqual(['col2', 'col4']);
            }));
        });

        describe('without persistSearch', () => {
            it('should select col3 via route data', fakeAsync(() => {
                component.persistSearch = false;
                fixture.detectChanges();
                tick(1000);

                expect(component.columnsForTable).toEqual(['col3']);

                selectingDifferentColumnsWillNotPersistThem(['col3']);
            }));

            it('should ignore direct @Input and select col3 via route data', fakeAsync(() => {
                component.persistSearch = false;
                component.selectedColumns = ['col1', 'invalid-column'];
                fixture.detectChanges();
                tick(1000);

                expect(component.columnsForTable).toEqual(['col3']);

                selectingDifferentColumnsWillNotPersistThem(['col3']);
            }));

            it('should not reload selection from persistence without @Input', fakeAsync(() => {
                component.persistSearch = false;
                mockColumnsInPersistence();
                fixture.detectChanges();
                tick(1000);

                expect(component.columnsForTable).toEqual(['col3']);
            }));

            it('should not reload selection from persistence even with @Input', fakeAsync(() => {
                component.persistSearch = false;
                mockColumnsInPersistence();
                component.selectedColumns = ['col1', 'invalid-column'];
                fixture.detectChanges();
                tick(1000);

                expect(component.columnsForTable).toEqual(['col3']);
            }));
        });
    });
});
