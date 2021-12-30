import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {SelectHierarchicComponent} from './select-hierarchic.component';
import {testImports} from '../shared/testing/module';

describe('Demo SelectHierarchicComponent', () => {
    let component: SelectHierarchicComponent;
    let fixture: ComponentFixture<SelectHierarchicComponent>;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [SelectHierarchicComponent],
                imports: [...testImports],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(SelectHierarchicComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
