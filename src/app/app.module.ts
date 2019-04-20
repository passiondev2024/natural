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
  NaturalSelectEnumModule,
  NaturalSelectModule,
  NaturalSidenavModule,
  NaturalStampModule,
  NaturalTableButtonModule,
  NaturalSearchModule
} from '@ecodev/natural';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
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
