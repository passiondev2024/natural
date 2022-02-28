import {MenuItemSpec} from 'prosemirror-menu';
import {EditorState} from 'prosemirror-state';
import {EditorView} from 'prosemirror-view';

/**
 * One item of the menu.
 *
 * This is the equivalent of `MenuItem` but without all the rendering logic since we use Angular
 * templates for rendering. Also it caches the state of the item everytime the editor state changes,
 * so Angular can query the state as often as needed without performance hit.
 */
export class Item {
    /**
     * Whether the item is 'active' (for example, the item for toggling the strong mark might be active when the cursor is in strong text).
     */
    public active = false;

    /**
     * Button is shown but disabled, because the item cannot be (un-)applied
     */
    public disabled = false;

    /**
     * Whether the item is shown at the moment
     */
    public show = true;

    constructor(public readonly spec: MenuItemSpec) {}

    /**
     * Update the item state according to the editor state
     */
    public update(view: EditorView, state: EditorState): void {
        if (this.spec.active) {
            this.active = this.spec.active(state);
        }

        if (this.spec.enable) {
            this.disabled = !this.spec.enable(state);
        }

        if (this.spec.select) {
            this.show = this.spec.select(state);
        }
    }
}
