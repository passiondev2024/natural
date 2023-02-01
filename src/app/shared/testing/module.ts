import {BrowserAnimationsModule, NoopAnimationsModule} from '@angular/platform-browser/animations';
import {RouterTestingModule} from '@angular/router/testing';
import {
    NaturalAlertModule,
    NaturalAvatarModule,
    NaturalColumnsPickerModule,
    NaturalCommonModule,
    NaturalDetailHeaderModule,
    NaturalDropdownComponentsModule,
    NaturalFileModule,
    NaturalFixedButtonDetailModule,
    NaturalFixedButtonModule,
    NaturalHierarchicSelectorModule,
    NaturalIconModule,
    NaturalRelationsModule,
    NaturalSearchModule,
    NaturalSelectModule,
    NaturalSidenavModule,
    NaturalStampModule,
    NaturalTableButtonModule,
} from '@ecodev/natural';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgModule} from '@angular/core';
import {HttpClientModule} from '@angular/common/http';
import {MaterialModule} from '../../material.module';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {NaturalEditorModule} from '@ecodev/natural-editor';
import {ApolloModule} from 'apollo-angular';

export const testImports: Required<NgModule>['imports'] = [
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    MaterialModule,
    MatSnackBarModule,
    NaturalAlertModule,
    NaturalAvatarModule,
    NaturalColumnsPickerModule,
    NaturalCommonModule,
    NaturalDetailHeaderModule,
    NaturalDropdownComponentsModule,
    NaturalEditorModule,
    NaturalFileModule,
    NaturalFixedButtonDetailModule,
    NaturalFixedButtonModule,
    NaturalHierarchicSelectorModule,
    NaturalIconModule.forRoot({}),
    NaturalRelationsModule,
    NaturalSearchModule,
    NaturalSelectModule,
    NaturalSidenavModule,
    NaturalStampModule,
    NaturalTableButtonModule,
    NoopAnimationsModule,
    ReactiveFormsModule,
    RouterTestingModule,
    ApolloModule,
];
