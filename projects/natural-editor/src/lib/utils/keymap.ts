import {
    chainCommands,
    exitCode,
    joinDown,
    joinUp,
    Keymap,
    lift,
    selectParentNode,
    setBlockType,
    toggleMark,
    wrapIn,
} from 'prosemirror-commands';
import {liftListItem, sinkListItem, splitListItem, wrapInList} from 'prosemirror-schema-list';
import {redo, undo} from 'prosemirror-history';
import {undoInputRule} from 'prosemirror-inputrules';
import {MarkType, NodeType, Schema} from 'prosemirror-model';

/**
 * Inspect the given schema looking for marks and nodes from the
 * basic schema, and if found, add key bindings related to them.
 * This will add:
 *
 * * **Mod-b** for toggling [strong](#schema-basic.StrongMark)
 * * **Mod-i** for toggling [emphasis](#schema-basic.EmMark)
 * * **Mod-`** for toggling [code font](#schema-basic.CodeMark)
 * * **Ctrl-Shift-0** for making the current textblock a paragraph
 * * **Ctrl-Shift-1** to **Ctrl-Shift-Digit6** for making the current
 *   textblock a heading of the corresponding level
 * * **Ctrl-Shift-Backslash** to make the current textblock a code block
 * * **Ctrl-Shift-8** to wrap the selection in an ordered list
 * * **Ctrl-Shift-9** to wrap the selection in a bullet list
 * * **Ctrl->** to wrap the selection in a block quote
 * * **Enter** to split a non-empty textblock in a list item while at
 *   the same time splitting the list item
 * * **Mod-Enter** to insert a hard break
 * * **Mod-_** to insert a horizontal rule
 * * **Backspace** to undo an input rule
 * * **Alt-ArrowUp** to `joinUp`
 * * **Alt-ArrowDown** to `joinDown`
 * * **Mod-BracketLeft** to `lift`
 * * **Escape** to `selectParentNode`
 *
 * You can suppress or map these bindings by passing a `mapKeys`
 * argument, which maps key names (say `"Mod-B"` to either `false`, to
 * remove the binding, or a new key name string.
 */
export function buildKeymap(schema: Schema, isMac: boolean): Keymap {
    const keys: Keymap = {};

    keys['Mod-z'] = undo;
    keys['Shift-Mod-z'] = redo;
    keys['Backspace'] = undoInputRule;
    if (!isMac) {
        keys['Mod-y'] = redo;
    }

    keys['Alt-ArrowUp'] = joinUp;
    keys['Alt-ArrowDown'] = joinDown;
    keys['Mod-BracketLeft'] = lift;
    keys['Escape'] = selectParentNode;

    let type: MarkType | NodeType = schema.marks.strong;
    if (type) {
        keys['Mod-b'] = toggleMark(type);
        keys['Mod-B'] = toggleMark(type);
    }

    type = schema.marks.em;
    if (type) {
        keys['Mod-i'] = toggleMark(type);
        keys['Mod-I'] = toggleMark(type);
    }

    type = schema.marks.code;
    if (type) {
        keys['Mod-`'] = toggleMark(type);
    }

    type = schema.nodes.bullet_list;
    if (type) {
        keys['Shift-Ctrl-8'] = wrapInList(type);
    }

    type = schema.nodes.ordered_list;
    if (type) {
        keys['Shift-Ctrl-9'] = wrapInList(type);
    }

    type = schema.nodes.blockquote;
    if (type) {
        keys['Ctrl->'] = wrapIn(type);
    }

    type = schema.nodes.hard_break;
    if (type) {
        const br = type;
        const cmd = chainCommands(exitCode, (state, dispatch) => {
            dispatch?.(state.tr.replaceSelectionWith(br.create()).scrollIntoView());
            return true;
        });
        keys['Mod-Enter'] = cmd;
        keys['Shift-Enter'] = cmd;
        if (isMac) {
            keys['Ctrl-Enter'] = cmd;
        }
    }

    type = schema.nodes.list_item;
    if (type) {
        keys['Enter'] = splitListItem(type);
        keys['Mod-['] = liftListItem(type);
        keys['Mod-]'] = sinkListItem(type);
    }

    type = schema.nodes.paragraph;
    if (type) {
        keys['Shift-Ctrl-0'] = setBlockType(type);
    }

    type = schema.nodes.code_block;
    if (type) {
        keys['Shift-Ctrl-\\'] = setBlockType(type);
    }

    type = schema.nodes.heading;
    if (type) {
        for (let i = 1; i <= 6; i++) {
            keys['Shift-Ctrl-' + i] = setBlockType(type, {level: i});
        }
    }

    type = schema.nodes.horizontal_rule;
    if (type) {
        const hr = type;
        keys['Mod-_'] = (state, dispatch) => {
            dispatch?.(state.tr.replaceSelectionWith(hr.create()).scrollIntoView());
            return true;
        };
    }

    return keys;
}
