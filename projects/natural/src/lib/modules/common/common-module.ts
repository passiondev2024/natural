import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {NaturalHttpPrefixDirective} from '../../directives/http-prefix.directive';
import {NaturalLinkableTabDirective} from './directives/linkable-tab.directive';
import {NaturalCapitalizePipe} from './pipes/capitalize.pipe';
import {NaturalEllipsisPipe} from './pipes/ellipsis.pipe';
import {NaturalEnumPipe} from './pipes/enum.pipe';
import {localStorageProvider, sessionStorageProvider} from './services/memory-storage';
import {NaturalSwissDatePipe} from './pipes/swiss-date.pipe';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {NaturalSrcDensityDirective} from './directives/src-density.directive';
import {NaturalTimeAgoPipe} from './pipes/time-ago.pipe';

const declarationsToExport = [
    NaturalCapitalizePipe,
    NaturalEllipsisPipe,
    NaturalEnumPipe,
    NaturalHttpPrefixDirective,
    NaturalLinkableTabDirective,
    NaturalSrcDensityDirective,
    NaturalSwissDatePipe,
    NaturalTimeAgoPipe,
];

@NgModule({
    declarations: [...declarationsToExport],
    imports: [CommonModule, MatFormFieldModule, MatInputModule, MatSelectModule],
    exports: [...declarationsToExport],
    providers: [sessionStorageProvider, localStorageProvider],
})
export class NaturalCommonModule {}
