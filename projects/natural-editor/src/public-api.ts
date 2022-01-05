// Load `$localize` onto the global scope - to be able to use that function to translate strings in components/services.
import '@angular/localize/init';

/*
 * Public API Surface of natural-editor
 */

export {NaturalEditorComponent} from './lib/editor/editor.component';
export {NaturalEditorModule} from './lib/editor.module';
