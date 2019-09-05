import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
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
    NaturalLinkMutationService,
    NaturalPanelsModule,
    NaturalRelationsModule,
    NaturalSearchModule,
    NaturalSelectEnumModule,
    NaturalSelectModule,
    NaturalSidenavModule,
    NaturalStampModule,
    NaturalTableButtonModule,
} from '@ecodev/natural';
import { ApolloModule } from 'apollo-angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { HomepageComponent } from './homepage/homepage.component';
import { ListComponent } from './list/list.component';
import { MaterialModule } from './material.module';
import { PanelsComponent } from './panels/panels.component';
import { RelationsComponent } from './relations/relations.component';
import { SearchComponent } from './search/search.component';
import { SelectComponent } from './select/select.component';
import { AnyComponent } from './shared/components/any/any.component';
import { AnyLinkMutationService } from './shared/services/any-link-mutation.service';
import { EditableListComponent } from './editable-list/editable-list.component';
import { HierarchicComponent } from './hierarchic/hierarchic.component';

@NgModule({
    declarations: [
        AppComponent,
        HomeComponent,
        SearchComponent,
        HomepageComponent,
        ListComponent,
        SelectComponent,
        AnyComponent,
        PanelsComponent,
        RelationsComponent,
        EditableListComponent,
        HierarchicComponent,
    ],
    entryComponents: [
        AnyComponent,
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        AppRoutingModule,
        MaterialModule,
        FlexLayoutModule,
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
        ApolloModule,
        NaturalDropdownComponentsModule,
        NaturalPanelsModule.forRoot({}),

    ],
    providers: [
        {
            provide: NaturalLinkMutationService,
            useClass: AnyLinkMutationService,
        },
    ],
    bootstrap: [AppComponent],
})
export class AppModule {
}
