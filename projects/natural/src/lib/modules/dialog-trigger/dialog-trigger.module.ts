import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatLegacyDialogModule as MatDialogModule} from '@angular/material/legacy-dialog';
import {NaturalDialogTriggerComponent} from './dialog-trigger.component';

@NgModule({
    declarations: [NaturalDialogTriggerComponent],
    imports: [CommonModule, MatDialogModule],
    exports: [NaturalDialogTriggerComponent],
})
export class NaturalDialogTriggerModule {}
