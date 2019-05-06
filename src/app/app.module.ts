import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
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

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { MaterialModule } from './material.module';
import { SearchComponent } from './search/search.component';
import { HomepageComponent } from './homepage/homepage.component';

@NgModule({
    declarations: [
        AppComponent,
        HomeComponent,
        SearchComponent,
        HomepageComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        AppRoutingModule,
        MaterialModule,
        NaturalSelectModule,
        NaturalSearchModule,
        NaturalCommonModule,
        NaturalHierarchicSelectorModule,
        NaturalSidenavModule,
        NaturalSelectModule,
        NaturalRelationsModule,
        NaturalAlertModule,
        NaturalColumnsPickerModule,
        NaturalSelectEnumModule,
        NaturalStampModule,
        NaturalDetailHeaderModule,
        NaturalTableButtonModule,
        NaturalFixedButtonModule,
        NaturalFixedButtonDetailModule,
        NaturalIconModule.forRoot({}),
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {
}
