import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NaturalEllipsisPipe } from './pipes/ellipsis.pipe';
import { NaturalEnumPipe } from './pipes/enum.pipe';
import { NaturalCapitalizePipe } from './pipes/capitalize.pipe';

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
