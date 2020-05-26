import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {NaturalIconModule} from '../icon/icon.module';
import {NaturalFixedButtonComponent} from './fixed-button.component';
import {NaturalFixedButtonModule} from './fixed-button.module';

describe('FixedButtonComponent', () => {
    let component: NaturalFixedButtonComponent;
    let fixture: ComponentFixture<NaturalFixedButtonComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [],
            imports: [RouterTestingModule, NaturalIconModule.forRoot({}), NaturalFixedButtonModule],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(NaturalFixedButtonComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
