import {ComponentFixture, TestBed} from '@angular/core/testing';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';

import {NaturalGroupComponent} from './group.component';

describe('GroupComponent', () => {
    let component: NaturalGroupComponent;
    let fixture: ComponentFixture<NaturalGroupComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [NoopAnimationsModule],
        }).compileComponents();
        fixture = TestBed.createComponent(NaturalGroupComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
