import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NaturalCapitalizePipe } from './pipes/capitalize.pipe';
import { NaturalEllipsisPipe } from './pipes/ellipsis.pipe';
import { NaturalEnumPipe } from './pipes/enum.pipe';

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
})
export class NaturalCommonModule {
}
