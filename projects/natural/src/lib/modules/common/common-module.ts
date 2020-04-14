import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NaturalCapitalizePipe } from './pipes/capitalize.pipe';
import { NaturalEllipsisPipe } from './pipes/ellipsis.pipe';
import { NaturalEnumPipe } from './pipes/enum.pipe';
import { sessionStorageProvider } from './services/memory-storage';

const declarationsToExport = [
    NaturalEllipsisPipe,
    NaturalEnumPipe,
    NaturalCapitalizePipe,
];

@NgModule({
    declarations: [
        ...declarationsToExport,
    ],
    imports: [
        CommonModule,
    ],
    exports: [
        ...declarationsToExport,
    ],
    providers: [
        sessionStorageProvider,
    ],
})
export class NaturalCommonModule {
}
