import {NgModule} from '@angular/core';
import {FlexLayoutModule} from '@angular/flex-layout';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {
    NaturalAlertModule,
    NaturalColumnsPickerModule,
    NaturalCommonModule,
    NaturalDetailHeaderModule,
    NaturalDropdownComponentsModule,
    NaturalFileModule,
    NaturalFixedButtonDetailModule,
    NaturalFixedButtonModule,
    NaturalHierarchicSelectorModule,
    NaturalIconModule,
    NaturalLinkMutationService,
    NaturalPanelsModule,
    NaturalRelationsModule,
    NaturalSearchModule,
    NaturalSelectModule,
    NaturalSidenavModule,
    NaturalStampModule,
    NaturalTableButtonModule,
} from '@ecodev/natural';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {HomeComponent} from './home/home.component';
import {HomepageComponent} from './homepage/homepage.component';
import {ListComponent} from './list/list.component';
import {MaterialModule} from './material.module';
import {NavigableListComponent} from './navigable-list/navigable-list.component';
import {OtherComponent} from './other/other.component';
import {PanelsComponent} from './panels/panels.component';
import {RelationsComponent} from './relations/relations.component';
import {SearchComponent} from './search/search.component';
import {SelectComponent} from './select/select.component';
import {AnyComponent} from './shared/components/any/any.component';
import {AnyLinkMutationService} from './shared/services/any-link-mutation.service';
import {EditableListComponent} from './editable-list/editable-list.component';
import {HierarchicComponent} from './hierarchic/hierarchic.component';
import {AlertComponent} from './alert/alert.component';
import {DetailComponent} from './detail/detail.component';
import {SelectEnumComponent} from './select-enum/select-enum.component';
import {SelectHierarchicComponent} from './select-hierarchic/select-hierarchic.component';
import {FileComponent} from './file/file.component';
import {HttpClientModule} from '@angular/common/http';

@NgModule({
    declarations: [
        AppComponent,
        HomeComponent,
        SearchComponent,
        HomepageComponent,
        ListComponent,
        SelectComponent,
        SelectEnumComponent,
        AnyComponent,
        PanelsComponent,
        RelationsComponent,
        EditableListComponent,
        HierarchicComponent,
        NavigableListComponent,
        AlertComponent,
        DetailComponent,
        SelectHierarchicComponent,
        OtherComponent,
        FileComponent,
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        AppRoutingModule,
        MaterialModule,
        HttpClientModule,
        FlexLayoutModule,
        NaturalSelectModule,
        NaturalSearchModule,
        NaturalCommonModule,
        NaturalHierarchicSelectorModule,
        NaturalSidenavModule,
        NaturalRelationsModule,
        NaturalAlertModule,
        NaturalColumnsPickerModule,
        NaturalStampModule,
        NaturalDetailHeaderModule,
        NaturalTableButtonModule,
        NaturalFixedButtonModule,
        NaturalFixedButtonDetailModule,
        NaturalIconModule.forRoot({
            natural: {
                svg: 'assets/logo.svg',
            },
            github: {
                svg: 'assets/github.svg',
            },
        }),
        NaturalDropdownComponentsModule,
        NaturalPanelsModule.forRoot({}),
        NaturalFileModule,
    ],
    providers: [
        {
            provide: NaturalLinkMutationService,
            useClass: AnyLinkMutationService,
        },
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
