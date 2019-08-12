import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import {
    NaturalAlertModule,
    NaturalColumnsPickerModule,
    NaturalCommonModule,
    NaturalDetailHeaderModule,
    NaturalFixedButtonDetailModule,
    NaturalFixedButtonModule,
    NaturalHierarchicSelectorModule,
    NaturalIconModule,
    NaturalRelationsModule,
    NaturalSearchModule,
    NaturalSelectEnumModule,
    NaturalSelectModule,
    NaturalSidenavModule,
    NaturalStampModule,
    NaturalTableButtonModule,
} from '@ecodev/natural';
import { MaterialModule } from '../material.module';

import { HomeComponent } from './home.component';

describe('Demo HomeComponent', () => {
    let component: HomeComponent;
    let fixture: ComponentFixture<HomeComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                HomeComponent,
            ],
            imports: [
                RouterTestingModule,
                BrowserAnimationsModule,
                MaterialModule,
                NaturalAlertModule,
                NaturalStampModule,
                NaturalSelectModule,
                NaturalSidenavModule,
                NaturalRelationsModule,
                NaturalSelectEnumModule,
                NaturalFixedButtonModule,
                NaturalTableButtonModule,
                NaturalDetailHeaderModule,
                NaturalColumnsPickerModule,
                NaturalFixedButtonDetailModule,
                NaturalHierarchicSelectorModule,
                NaturalCommonModule,
                NaturalSearchModule,
                NaturalIconModule.forRoot({}),
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(HomeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

});
