import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {NaturalHttpPrefixDirective} from '../../directives/http-prefix.directive';
import {NaturalLinkableTabDirective} from './directives/linkable-tab.directive';
import {NaturalCapitalizePipe} from './pipes/capitalize.pipe';
import {NaturalEllipsisPipe} from './pipes/ellipsis.pipe';
import {NaturalEnumPipe} from './pipes/enum.pipe';
import {localStorageProvider, sessionStorageProvider} from './services/memory-storage';
import {NaturalSwissDatePipe} from './pipes/swiss-date.pipe';
import {MatLegacyFormFieldModule as MatFormFieldModule} from '@angular/material/legacy-form-field';
import {MatLegacyInputModule as MatInputModule} from '@angular/material/legacy-input';
import {MatLegacySelectModule as MatSelectModule} from '@angular/material/legacy-select';
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
