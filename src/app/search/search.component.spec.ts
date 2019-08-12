import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ApolloModule } from 'apollo-angular';
import { MockApolloProvider } from '../../../projects/natural/src/lib/testing/mock-apollo.provider';

import { SearchComponent } from './search.component';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from '../material.module';
import {
    NaturalAlertModule,
    NaturalColumnsPickerModule,
    NaturalCommonModule,
    NaturalDetailHeaderModule,
    NaturalDropdownComponentsModule,
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

describe('Demo SearchComponent', () => {
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
                ApolloModule,
                NaturalIconModule.forRoot({}),
            ],
            providers: [
                MockApolloProvider,
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
