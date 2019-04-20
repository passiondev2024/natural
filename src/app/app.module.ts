import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
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

@NgModule({
    declarations: [
        AppComponent,
        HomeComponent,
    ],
    imports: [
        BrowserModule,
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
