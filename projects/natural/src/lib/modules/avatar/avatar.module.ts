import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AvatarComponent} from './component/avatar.component';

const declarations = [AvatarComponent];

@NgModule({
    imports: [CommonModule],
    declarations: declarations,
    exports: declarations,
})
export class NaturalAvatarModule {}
