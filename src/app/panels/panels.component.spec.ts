import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { PanelsComponent } from './panels.component';

describe('Demo PanelsComponent', () => {
    let component: PanelsComponent;
    let fixture: ComponentFixture<PanelsComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                PanelsComponent,
            ],
            imports: [
                RouterTestingModule,
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PanelsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
