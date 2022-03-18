import {ComponentFixture, TestBed} from '@angular/core/testing';
import {SelectEnumComponent} from './select-enum.component';
import {testImports} from '../shared/testing/module';

describe('Demo SelectEnumComponent', () => {
    let component: SelectEnumComponent;
    let fixture: ComponentFixture<SelectEnumComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [SelectEnumComponent],
            imports: [...testImports],
        }).compileComponents();
        fixture = TestBed.createComponent(SelectEnumComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
