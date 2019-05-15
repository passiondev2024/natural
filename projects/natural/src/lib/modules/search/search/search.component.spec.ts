import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NaturalIconModule } from '@ecodev/natural';
import { NaturalSearchComponent } from './search.component';
import { NaturalGroupComponent } from '../group/group.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NaturalDropdownService } from '../dropdown-container/dropdown.service';
import {
    MatButtonModule,
    MatCheckboxModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatRippleModule,
} from '@angular/material';
import { PortalModule } from '@angular/cdk/portal';
import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { TypeNumericComponent } from '../dropdown-components/type-numeric/type-numeric.component';
import { TypeSelectComponent } from '../dropdown-components/type-select/type-select.component';
import { NaturalDropdownContainerComponent } from '../dropdown-container/dropdown-container.component';
import { NaturalInputComponent } from '../input/input.component';
import { ConfigurationSelectorComponent } from '../dropdown-components/configuration-selector/configuration-selector.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

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
                TypeNumericComponent,
                ConfigurationSelectorComponent,
                TypeSelectComponent,
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
