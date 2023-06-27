import {ComponentFixture, TestBed} from '@angular/core/testing';
import {OtherComponent} from './other.component';
import {HttpClientModule} from '@angular/common/http';
import {RouterTestingModule} from '@angular/router/testing';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';

describe('OtherComponent', () => {
    let component: OtherComponent;
    let fixture: ComponentFixture<OtherComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [NoopAnimationsModule, HttpClientModule, RouterTestingModule],
        }).compileComponents();
        fixture = TestBed.createComponent(OtherComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
