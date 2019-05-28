import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule, MatInputModule, MatListModule, MatMenuModule, MatRippleModule } from '@angular/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NaturalIconModule } from '@ecodev/natural';
import { FacetSelectorComponent } from '../facet-selector/facet-selector.component';
import { NaturalDropdownContainerComponent } from '../dropdown-container/dropdown-container.component';
import { NaturalGroupComponent } from '../group/group.component';
import { NaturalInputComponent } from '../input/input.component';
import { NaturalSearchComponent } from './search.component';

describe('NaturalSearchComponent', () => {
    let component: NaturalSearchComponent;
    let fixture: ComponentFixture<NaturalSearchComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                NaturalSearchComponent,
                NaturalGroupComponent,
                NaturalInputComponent,
                NaturalDropdownContainerComponent,
                FacetSelectorComponent,
            ],
            imports: [
                NoopAnimationsModule,
                CommonModule,
                FormsModule,
                ReactiveFormsModule,
                MatInputModule,
                MatButtonModule,
                MatMenuModule,
                MatRippleModule,
                PortalModule,
                OverlayModule,
                MatListModule,
                NaturalIconModule.forRoot({}),
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(NaturalSearchComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
