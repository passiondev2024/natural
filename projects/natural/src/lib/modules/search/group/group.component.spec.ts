import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NaturalGroupComponent } from './group.component';
import { NaturalInputComponent } from '../input/input.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule, MatInputModule } from '@angular/material';
import { NaturalDropdownService } from '../dropdown-container/dropdown.service';
import { OverlayModule } from '@angular/cdk/overlay';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('GroupComponent', () => {
    let component: NaturalGroupComponent;
    let fixture: ComponentFixture<NaturalGroupComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                NaturalGroupComponent,
                NaturalInputComponent,
            ],
            imports: [
                NoopAnimationsModule,
                ReactiveFormsModule,
                MatInputModule,
                MatIconModule,
                OverlayModule,
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(NaturalGroupComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
