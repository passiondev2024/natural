import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
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
