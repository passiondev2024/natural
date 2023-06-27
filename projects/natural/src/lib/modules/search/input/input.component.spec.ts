import {ComponentFixture, TestBed} from '@angular/core/testing';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {NaturalInputComponent} from './input.component';

describe('NaturalInputComponent', () => {
    let component: NaturalInputComponent;
    let fixture: ComponentFixture<NaturalInputComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [NoopAnimationsModule],
        }).compileComponents();
        fixture = TestBed.createComponent(NaturalInputComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
