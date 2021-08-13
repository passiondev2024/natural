import {ComponentFixture, fakeAsync, TestBed, tick, waitForAsync} from '@angular/core/testing';
import {
    memorySessionStorageProvider,
    NaturalAbstractList,
    NaturalColumnsPickerModule,
    NaturalCommonModule,
    NaturalIconModule,
    NaturalPersistenceService,
} from '@ecodev/natural';
import {AnyService} from '../testing/any.service';
import {Component, Injector} from '@angular/core';
import {RouterTestingModule} from '@angular/router/testing';
import {MaterialModule} from '../../../../../src/app/material.module';
import {ActivatedRoute, Data} from '@angular/router';

@Component({
    template: ` <natural-columns-picker [(selection)]="selectedColumns" [initialSelection]="initialColumns">
        <span naturalColumnsPickerColumn="col1">column 1</span>
        <span naturalColumnsPickerColumn="col2" [checked]="false">column 2</span>
        <span naturalColumnsPickerColumn="col3">column 3</span>
        <span naturalColumnsPickerColumn="col4">column 4</span>
        <span naturalColumnsPickerColumn="hidden" [hidden]="true">hidden in menu</span>
    </natural-columns-picker>`,
})
class TestListComponent extends NaturalAbstractList<AnyService> {
    constructor(service: AnyService, injector: Injector) {
        super(service, injector);
    }

    protected getStorageKey(): string {
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

        expect(component.selectedColumns).toEqual(defaultColumns);
        expect(persistSpy).toHaveBeenCalledOnceWith('col', null, mockedActivatedRoute, 'test-key');

        // Selecting different columns will persist them
        component.selectedColumns = ['col1', 'col2'];
        fixture.detectChanges();
        tick(1000);

        expect(component.selectedColumns).toEqual(['col1', 'col2']);
        expect(persistSpy).toHaveBeenCalledOnceWith('col', 'col1,col2', mockedActivatedRoute, 'test-key');
    }

    function selectingDifferentColumnsWillNotPersistThem(defaultColumns: string[]): void {
        // Nothing has been persisted so far
        expect(persistSpy).not.toHaveBeenCalled();

        // Selecting exactly same columns will not delete persistence
        component.selectedColumns = defaultColumns;
        fixture.detectChanges();
        tick(1000);

        expect(component.selectedColumns).toEqual(defaultColumns);
        expect(persistSpy).not.toHaveBeenCalled();

        // Selecting different columns will not persist them
        component.selectedColumns = ['col1', 'col2'];
        fixture.detectChanges();
        tick(1000);

        expect(component.selectedColumns).toEqual(['col1', 'col2']);
        expect(persistSpy).not.toHaveBeenCalled();
    }

    function mockColumnsInPersistence(): void {
        getSpy.and.callFake(key => (key === 'col' ? 'col2,col4' : null));
    }

    describe('without route data', () => {
        beforeEach(waitForAsync(() => createComponent({})));
        it('should create', () => {
            expect(component).toBeTruthy();
        });

        describe('with persistSearch', () => {
            it('should select all columns except col2 which is unchecked by template', fakeAsync(() => {
                fixture.detectChanges();
                tick(1000);

                expect(component.selectedColumns).toEqual(['col1', 'col3', 'col4', 'hidden']);

                selectingDifferentColumnsWillPersistThem(['col1', 'col3', 'col4', 'hidden']);
            }));

            it('should select all valid initialColumns', fakeAsync(() => {
                component.initialColumns = ['col1', 'invalid-column'];
                fixture.detectChanges();
                tick(1000);

                expect(component.selectedColumns).toEqual(['col1']);

                selectingDifferentColumnsWillPersistThem(['col1']);
            }));

            it('should reload selection from persistence without @Input', fakeAsync(() => {
                mockColumnsInPersistence();
                fixture.detectChanges();
                tick(1000);

                expect(component.selectedColumns).toEqual(['col2', 'col4']);
            }));

            it('should reload selection from persistence even with @Input', fakeAsync(() => {
                mockColumnsInPersistence();
                component.initialColumns = ['col1', 'invalid-column'];
                fixture.detectChanges();
                tick(1000);

                expect(component.selectedColumns).toEqual(['col2', 'col4']);
            }));
        });

        describe('without persistSearch', () => {
            it('should select all columns except col2 which is unchecked by template', fakeAsync(() => {
                component.persistSearch = false;
                fixture.detectChanges();
                tick(1000);

                expect(component.selectedColumns).toEqual(['col1', 'col3', 'col4', 'hidden']);

                selectingDifferentColumnsWillNotPersistThem(['col1', 'col3', 'col4', 'hidden']);
            }));

            it('should select all valid initialColumns', fakeAsync(() => {
                component.persistSearch = false;
                component.initialColumns = ['col1', 'invalid-column'];
                fixture.detectChanges();
                tick(1000);

                expect(component.selectedColumns).toEqual(['col1']);

                selectingDifferentColumnsWillNotPersistThem(['col1']);
            }));

            it('should not reload selection from persistence without @Input', fakeAsync(() => {
                component.persistSearch = false;
                mockColumnsInPersistence();
                fixture.detectChanges();
                tick(1000);

                expect(component.selectedColumns).toEqual(['col1', 'col3', 'col4', 'hidden']);
            }));

            it('should not reload selection from persistence even with @Input', fakeAsync(() => {
                component.persistSearch = false;
                mockColumnsInPersistence();
                component.initialColumns = ['col1', 'invalid-column'];
                fixture.detectChanges();
                tick(1000);

                expect(component.selectedColumns).toEqual(['col1']);
            }));
        });
    });

    describe('with route data for col3', () => {
        beforeEach(waitForAsync(() => createComponent({initialColumns: ['col3', 'invalid-column']})));

        it('should create', () => {
            expect(component).toBeTruthy();
        });

        describe('with persistSearch', () => {
            it('should select col3 via route data', fakeAsync(() => {
                fixture.detectChanges();
                tick(1000);

                expect(component.selectedColumns).toEqual(['col3']);

                selectingDifferentColumnsWillPersistThem(['col3']);
            }));

            it('should ignore direct @Input and select col3 via route data', fakeAsync(() => {
                component.initialColumns = ['col1', 'invalid-column'];
                fixture.detectChanges();
                tick(1000);

                expect(component.selectedColumns).toEqual(['col3']);

                selectingDifferentColumnsWillPersistThem(['col3']);
            }));

            it('should reload selection from persistence without @Input', fakeAsync(() => {
                mockColumnsInPersistence();
                fixture.detectChanges();
                tick(1000);

                expect(component.selectedColumns).toEqual(['col2', 'col4']);
            }));

            it('should reload selection from persistence even with @Input', fakeAsync(() => {
                mockColumnsInPersistence();
                component.initialColumns = ['col1', 'invalid-column'];
                fixture.detectChanges();
                tick(1000);

                expect(component.selectedColumns).toEqual(['col2', 'col4']);
            }));
        });

        describe('without persistSearch', () => {
            it('should select col3 via route data', fakeAsync(() => {
                component.persistSearch = false;
                fixture.detectChanges();
                tick(1000);

                expect(component.selectedColumns).toEqual(['col3']);

                selectingDifferentColumnsWillNotPersistThem(['col3']);
            }));

            it('should ignore direct @Input and select col3 via route data', fakeAsync(() => {
                component.persistSearch = false;
                component.initialColumns = ['col1', 'invalid-column'];
                fixture.detectChanges();
                tick(1000);

                expect(component.selectedColumns).toEqual(['col3']);

                selectingDifferentColumnsWillNotPersistThem(['col3']);
            }));

            it('should not reload selection from persistence without @Input', fakeAsync(() => {
                component.persistSearch = false;
                mockColumnsInPersistence();
                fixture.detectChanges();
                tick(1000);

                expect(component.selectedColumns).toEqual(['col3']);
            }));

            it('should not reload selection from persistence even with @Input', fakeAsync(() => {
                component.persistSearch = false;
                mockColumnsInPersistence();
                component.initialColumns = ['col1', 'invalid-column'];
                fixture.detectChanges();
                tick(1000);

                expect(component.selectedColumns).toEqual(['col3']);
            }));
        });
    });
});
