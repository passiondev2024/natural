import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NaturalDropdownContainerComponent } from './dropdown-container.component';
import { MatCheckboxModule, MatCommonModule } from '@angular/material';
import { CommonModule } from '@angular/common';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { PortalModule } from '@angular/cdk/portal';
import { OverlayModule } from '@angular/cdk/overlay';

describe('NaturalDropdownContainerComponent', () => {
    let component: NaturalDropdownContainerComponent;
    let fixture: ComponentFixture<NaturalDropdownContainerComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [NaturalDropdownContainerComponent],
            imports: [
                NoopAnimationsModule,
                CommonModule,
                OverlayModule,
                PortalModule,
                MatCommonModule,
                MatCheckboxModule,
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(NaturalDropdownContainerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
