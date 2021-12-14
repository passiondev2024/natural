import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {NaturalEditorComponent} from './editor.component';

@NgModule({
    declarations: [NaturalEditorComponent],
    imports: [CommonModule],
    exports: [NaturalEditorComponent],
})
export class NaturalEditorModule {}
