import {OverlayModule} from '@angular/cdk/overlay';
import {waitForAsync, ComponentFixture, TestBed} from '@angular/core/testing';
import {ReactiveFormsModule} from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {NaturalIconModule} from '@ecodev/natural';
import {NaturalInputComponent} from '../input/input.component';

import {NaturalGroupComponent} from './group.component';

describe('GroupComponent', () => {
    let component: NaturalGroupComponent;
    let fixture: ComponentFixture<NaturalGroupComponent>;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [NaturalGroupComponent, NaturalInputComponent],
                imports: [
                    NoopAnimationsModule,
                    ReactiveFormsModule,
                    MatInputModule,
                    MatIconModule,
                    OverlayModule,
                    NaturalIconModule.forRoot({}),
                ],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(NaturalGroupComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
