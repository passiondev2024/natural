import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NaturalDropdownComponentsModule } from '../../../projects/natural/src/lib/modules/search/dropdown-components/natural-dropdown-components.module';

import { SearchComponent } from './search.component';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from '../material.module';
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

describe('SearchComponent', () => {
    let component: SearchComponent;
    let fixture: ComponentFixture<SearchComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [SearchComponent],
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
                NaturalDropdownComponentsModule,
                NaturalCommonModule,
                NaturalSearchModule,
                NaturalIconModule.forRoot({}),
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SearchComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
