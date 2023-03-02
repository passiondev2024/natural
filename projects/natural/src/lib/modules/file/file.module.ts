import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';

import {NaturalFileDropDirective} from './file-drop.directive';
import {NaturalFileSelectDirective} from './file-select.directive';
import {FileComponent} from './component/file.component';
import {NaturalIconModule} from '../icon/icon.module';
import {MatRippleModule} from '@angular/material/core';
import {NaturalCommonModule} from '../common/common-module';
import {MatIconModule} from '@angular/material/icon';

const declarations = [NaturalFileDropDirective, NaturalFileSelectDirective, FileComponent];

@NgModule({
    imports: [CommonModule, NaturalIconModule, MatRippleModule, NaturalCommonModule, MatIconModule],
    declarations: declarations,
    exports: declarations,
})
export class NaturalFileModule {}
