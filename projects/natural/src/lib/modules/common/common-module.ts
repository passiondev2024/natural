import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {ReactiveAsteriskDirective} from './directives/reactive-asterisk.directive';
import {NaturalCapitalizePipe} from './pipes/capitalize.pipe';
import {NaturalEllipsisPipe} from './pipes/ellipsis.pipe';
import {NaturalEnumPipe} from './pipes/enum.pipe';
import {sessionStorageProvider} from './services/memory-storage';
import {NaturalSwissDatePipe} from './pipes/swiss-date.pipe';
import {NaturalDefaultPipe} from './pipes/default.pipe';

const declarationsToExport = [
    NaturalCapitalizePipe,
    NaturalDefaultPipe,
    NaturalEllipsisPipe,
    NaturalEnumPipe,
    NaturalSwissDatePipe,
    ReactiveAsteriskDirective,
];

@NgModule({
    declarations: [...declarationsToExport],
    imports: [CommonModule],
    exports: [...declarationsToExport],
    providers: [sessionStorageProvider],
})
export class NaturalCommonModule {}
