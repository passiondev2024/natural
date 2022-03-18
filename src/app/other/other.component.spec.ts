import {ComponentFixture, TestBed} from '@angular/core/testing';
import {OtherComponent} from './other.component';
import {testImports} from '../shared/testing/module';

describe('OtherComponent', () => {
    let component: OtherComponent;
    let fixture: ComponentFixture<OtherComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [OtherComponent],
            imports: [...testImports],
        }).compileComponents();
        fixture = TestBed.createComponent(OtherComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
