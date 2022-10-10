import {NgModule} from '@angular/core';
import {NaturalStampComponent} from './stamp.component';
import {CommonModule} from '@angular/common';
import {NaturalCommonModule} from '../common/common-module';

const declarationsToExport = [NaturalStampComponent];

@NgModule({
    declarations: [...declarationsToExport],
    imports: [CommonModule, NaturalCommonModule],
    exports: [...declarationsToExport],
})
export class NaturalStampModule {}
