import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {NaturalHttpPrefixDirective} from '../../directives/http-prefix.directive';
import {NaturalLinkableTabDirective, NaturalLinkableTabNameDirective} from './directives/linkable-tab.directive';
import {ReactiveAsteriskDirective} from './directives/reactive-asterisk.directive';
import {NaturalCapitalizePipe} from './pipes/capitalize.pipe';
import {NaturalEllipsisPipe} from './pipes/ellipsis.pipe';
import {NaturalEnumPipe} from './pipes/enum.pipe';
import {sessionStorageProvider} from './services/memory-storage';
import {NaturalSwissDatePipe} from './pipes/swiss-date.pipe';
import {NaturalDefaultPipe} from './pipes/default.pipe';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';

const declarationsToExport = [
    NaturalCapitalizePipe,
    NaturalDefaultPipe,
    NaturalEllipsisPipe,
    NaturalEnumPipe,
    NaturalSwissDatePipe,
    ReactiveAsteriskDirective,
    NaturalHttpPrefixDirective,
    NaturalLinkableTabDirective,
    NaturalLinkableTabNameDirective,
];

@NgModule({
    declarations: [...declarationsToExport],
    imports: [CommonModule, MatFormFieldModule, MatInputModule, MatSelectModule],
    exports: [...declarationsToExport],
    providers: [sessionStorageProvider],
})
export class NaturalCommonModule {}
