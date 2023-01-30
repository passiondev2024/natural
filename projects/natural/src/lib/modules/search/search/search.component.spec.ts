import {OverlayModule} from '@angular/cdk/overlay';
import {PortalModule} from '@angular/cdk/portal';
import {CommonModule} from '@angular/common';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatLegacyButtonModule as MatButtonModule} from '@angular/material/legacy-button';
import {MatRippleModule} from '@angular/material/core';
import {MatLegacyInputModule as MatInputModule} from '@angular/material/legacy-input';
import {MatLegacyListModule as MatListModule} from '@angular/material/legacy-list';
import {MatLegacyMenuModule as MatMenuModule} from '@angular/material/legacy-menu';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {NaturalIconModule} from '@ecodev/natural';
import {NaturalDropdownContainerComponent} from '../dropdown-container/dropdown-container.component';
import {FacetSelectorComponent} from '../facet-selector/facet-selector.component';
import {NaturalGroupComponent} from '../group/group.component';
import {NaturalInputComponent} from '../input/input.component';
import {NaturalSearchComponent} from './search.component';

describe('NaturalSearchComponent', () => {
    let component: NaturalSearchComponent;
    let fixture: ComponentFixture<NaturalSearchComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
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
        fixture = TestBed.createComponent(NaturalSearchComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
