import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {HierarchicComponent} from './hierarchic.component';
import {testImports} from '../shared/testing/module';

describe('HierarchicComponent', () => {
    let component: HierarchicComponent;
    let fixture: ComponentFixture<HierarchicComponent>;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [HierarchicComponent],
                imports: [...testImports],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(HierarchicComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
