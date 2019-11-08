import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatDialogModule } from '@angular/material';
import { NaturalDialogTriggerComponent } from './dialog-trigger.component';

@NgModule({
    declarations: [
        NaturalDialogTriggerComponent,
    ],
    imports: [
        CommonModule,
        MatDialogModule,
    ],
    exports: [
        NaturalDialogTriggerComponent,
    ],
})
export class NaturalDialogTriggerModule {
}
