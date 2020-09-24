import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';

import {NaturalFileDropDirective} from './file-drop.directive';
import {NaturalFileSelectDirective} from './file-select.directive';

const declarations = [NaturalFileDropDirective, NaturalFileSelectDirective];

@NgModule({
    imports: [CommonModule],
    declarations: declarations,
    exports: declarations,
})
export class NaturalFileModule {}
