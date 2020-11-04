import {waitForAsync, ComponentFixture, TestBed} from '@angular/core/testing';
import {ReactiveFormsModule} from '@angular/forms';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {RouterTestingModule} from '@angular/router/testing';
import {NaturalIconModule, NaturalRelationsModule} from '@ecodev/natural';

import {RelationsComponent} from './relations.component';

describe('RelationsComponent', () => {
    let component: RelationsComponent;
    let fixture: ComponentFixture<RelationsComponent>;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [RelationsComponent],
                imports: [
                    NoopAnimationsModule,
                    ReactiveFormsModule,
                    RouterTestingModule,
                    NaturalRelationsModule,
                    MatSnackBarModule,
                    NaturalIconModule.forRoot({}),
                ],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(RelationsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
