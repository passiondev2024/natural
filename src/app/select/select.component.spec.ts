import {ComponentFixture, TestBed} from '@angular/core/testing';
import {SelectComponent} from './select.component';
import {testImports} from '../shared/testing/module';

describe('Demo SelectComponent', () => {
    let component: SelectComponent;
    let fixture: ComponentFixture<SelectComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [SelectComponent],
            imports: [...testImports],
        }).compileComponents();
        fixture = TestBed.createComponent(SelectComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
