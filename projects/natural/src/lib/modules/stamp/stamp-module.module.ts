import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NaturalStampComponent } from './stamp.component';

@NgModule({
    declarations: [
        NaturalStampComponent,
    ],
    imports: [
        CommonModule,
    ],
    exports: [
        NaturalStampComponent,
    ],
})
export class NaturalStampModule {
}
