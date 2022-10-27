import {Command, EditorState} from 'prosemirror-state';
import {MarkType} from 'prosemirror-model';
import {MenuItem, MenuItemSpec} from 'prosemirror-menu';
import {Item} from './item';
import {toggleMark} from 'prosemirror-commands';

export function markActive(state: EditorState, type: MarkType): boolean {
    const {from, $from, to, empty} = state.selection;
    if (empty) {
        return !!type.isInSet(state.storedMarks || $from.marks());
    } else {
        return state.doc.rangeHasMark(from, to, type);
    }
}

/**
 * Convert built-in `MenuItem` into our Angular specific `Item`
 */
export function menuItemToItem(item: MenuItem): Item {
    return new Item(item.spec);
}

/**
 * From a `Command`, creates a new `Item` that will have an automatic `enable` spec
 */
export function cmdToItem(cmd: Command, options: Partial<MenuItemSpec> = {}): Item {
    const passedOptions: MenuItemSpec = {
        run: cmd,
        ...options,
    };

    if (!options.enable && !options.select) {
        passedOptions.enable = state => cmd(state);
    }

    return new Item(passedOptions);
}

/**
 * From a `MarkType`, creates a new `Item` that will have an automatic `active` and `enable` spec
 */
export function markTypeToItem(markType: MarkType): Item {
    return cmdToItem(toggleMark(markType), {
        active(state: EditorState): boolean {
            return markActive(state, markType);
        },
    });
}

export function selectionContainsNodeType(state: EditorState, allowedNodeTypes: string[]): boolean {
    const {selection, doc} = state;
    const {from, to} = selection;
    let keepLooking = true;
    let found = false;

    doc.nodesBetween(from, to, node => {
        if (keepLooking && allowedNodeTypes.includes(node.type.name)) {
            keepLooking = false;
            found = true;
        }

        return keepLooking;
    });

    return found;
}
