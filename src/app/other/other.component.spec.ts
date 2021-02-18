import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {ReactiveFormsModule} from '@angular/forms';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {NaturalCommonModule, NaturalIconModule} from '@ecodev/natural';
import {MaterialModule} from '../material.module';

import {OtherComponent} from './other.component';

describe('OtherComponent', () => {
    let component: OtherComponent;
    let fixture: ComponentFixture<OtherComponent>;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [OtherComponent],
                imports: [
                    MaterialModule,
                    NaturalCommonModule,
                    NaturalIconModule.forRoot({}),
                    NoopAnimationsModule,
                    ReactiveFormsModule,
                ],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(OtherComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
