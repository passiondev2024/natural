import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {ReactiveFormsModule} from '@angular/forms';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {NaturalCommonModule} from '@ecodev/natural';
import {MaterialModule} from '../material.module';

import {OtherComponent} from './other.component';

describe('OtherComponent', () => {
    let component: OtherComponent;
    let fixture: ComponentFixture<OtherComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [OtherComponent],
            imports: [NoopAnimationsModule, ReactiveFormsModule, NaturalCommonModule, MaterialModule],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(OtherComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
