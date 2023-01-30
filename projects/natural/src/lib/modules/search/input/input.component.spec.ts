import {OverlayModule} from '@angular/cdk/overlay';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ReactiveFormsModule} from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';
import {MatLegacyInputModule as MatInputModule} from '@angular/material/legacy-input';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {NaturalIconModule} from '@ecodev/natural';
import {NaturalInputComponent} from './input.component';

describe('NaturalInputComponent', () => {
    let component: NaturalInputComponent;
    let fixture: ComponentFixture<NaturalInputComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [NaturalInputComponent],
            imports: [
                NoopAnimationsModule,
                ReactiveFormsModule,
                MatInputModule,
                MatIconModule,
                OverlayModule,
                NaturalIconModule.forRoot({}),
            ],
        }).compileComponents();
        fixture = TestBed.createComponent(NaturalInputComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
