import {
    blockTypeItem,
    joinUpItem,
    liftItem,
    MenuItem,
    MenuItemSpec,
    redoItem,
    selectParentNodeItem,
    undoItem,
    wrapItem,
} from 'prosemirror-menu';
import {EditorState, Transaction} from 'prosemirror-state';
import {Command, toggleMark} from 'prosemirror-commands';
import {wrapInList} from 'prosemirror-schema-list';
import {MarkType, NodeType, Schema} from 'prosemirror-model';
import {MatDialog} from '@angular/material/dialog';
import {LinkDialogComponent, LinkDialogData} from './link-dialog/link-dialog.component';
import {EditorView} from 'prosemirror-view';
import {
    addColumnAfter,
    addColumnBefore,
    addRowAfter,
    addRowBefore,
    deleteColumn,
    deleteRow,
    deleteTable,
    mergeCells,
    splitCell,
    toggleHeaderCell,
    toggleHeaderColumn,
    toggleHeaderRow,
} from 'prosemirror-tables';
import {addTable} from './table';

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

/**
 * Convert built-in `MenuItem` into our Angular specific `Item`
 */
function toItem(item: MenuItem): Item {
    return new Item(item.spec);
}

function canInsert(state: EditorState, nodeType: NodeType): boolean {
    const $from = state.selection.$from;
    for (let d = $from.depth; d >= 0; d--) {
        const index = $from.index(d);
        if ($from.node(d).canReplaceWith(index, index, nodeType)) {
            return true;
        }
    }

    return false;
}

function cmdItem(cmd: Command, options: Partial<MenuItemSpec> = {}, useEnable = false): Item {
    const passedOptions: MenuItemSpec = {
        run: cmd,
        ...options,
    };

    if ((!options.enable || useEnable) && !options.select) {
        passedOptions[options.enable ? 'enable' : 'select'] = (state: EditorState) => cmd(state);
    }

    return new Item(passedOptions);
}

function markActive(state: EditorState, type: MarkType): boolean {
    const {from, $from, to, empty} = state.selection;
    if (empty) {
        return !!type.isInSet(state.storedMarks || $from.marks());
    } else {
        return state.doc.rangeHasMark(from, to, type);
    }
}

function markItem(markType: MarkType, options: Partial<MenuItemSpec> = {}): Item {
    const passedOptions: Partial<MenuItemSpec> = {
        active(state: EditorState): boolean {
            return markActive(state, markType);
        },
        ...options,
    };

    return cmdItem(toggleMark(markType), passedOptions, true);
}

function linkItem(markType: MarkType, dialog: MatDialog): Item {
    return new Item({
        active(state: EditorState): boolean {
            return markActive(state, markType);
        },
        enable(state: EditorState): boolean {
            return !state.selection.empty;
        },
        run(state: EditorState, dispatch: (p: Transaction) => void, view: EditorView): boolean | void {
            if (markActive(state, markType)) {
                toggleMark(markType)(state, dispatch);
                return true;
            }

            dialog
                .open<LinkDialogComponent, LinkDialogData, LinkDialogData>(LinkDialogComponent, {
                    data: {
                        href: '',
                        title: '',
                    },
                })
                .afterClosed()
                .subscribe(result => {
                    if (result) {
                        if (!result.title) {
                            delete result.title;
                        }

                        toggleMark(markType, result)(view.state, view.dispatch);
                    }

                    view.focus();
                });
        },
    });
}

function wrapListItem(nodeType: NodeType): Item {
    return cmdItem(wrapInList(nodeType));
}

export type Key =
    | 'toggleStrong'
    | 'toggleEm'
    | 'toggleCode'
    | 'toggleLink'
    | 'wrapBulletList'
    | 'wrapOrderedList'
    | 'wrapBlockQuote'
    | 'makeParagraph'
    | 'makeCodeBlock'
    | 'makeHead1'
    | 'makeHead2'
    | 'makeHead3'
    | 'makeHead4'
    | 'makeHead5'
    | 'makeHead6'
    | 'insertHorizontalRule'
    | 'joinUp'
    | 'lift'
    | 'selectParentNode'
    | 'undo'
    | 'redo'
    | 'insertTable'
    | 'addColumnBefore'
    | 'addColumnAfter'
    | 'deleteColumn'
    | 'addRowBefore'
    | 'addRowAfter'
    | 'deleteRow'
    | 'deleteTable'
    | 'mergeCells'
    | 'splitCell'
    | 'toggleHeaderColumn'
    | 'toggleHeaderRow'
    | 'toggleHeaderCell';

export type MenuItems = Partial<Record<Key, Item>>;

/**
 * Given a schema, look for default mark and node types in it and
 * return an object with relevant menu items relating to those marks:
 */
export function buildMenuItems(schema: Schema, dialog: MatDialog): MenuItems {
    const r: MenuItems = {
        joinUp: toItem(joinUpItem),
        lift: toItem(liftItem),
        selectParentNode: toItem(selectParentNodeItem),
        undo: toItem(undoItem as unknown as MenuItem), // Typing is incorrect, so we force it
        redo: toItem(redoItem as unknown as MenuItem),
    };

    let type: MarkType | NodeType | undefined;
    type = schema.marks.strong;
    if (type) {
        r.toggleStrong = markItem(type);
    }

    type = schema.marks.em;
    if (type) {
        r.toggleEm = markItem(type);
    }

    type = schema.marks.code;
    if (type) {
        r.toggleCode = markItem(type);
    }

    type = schema.marks.link;
    if (type) {
        r.toggleLink = linkItem(type, dialog);
    }

    type = schema.nodes.bullet_list;
    if (type) {
        r.wrapBulletList = wrapListItem(type);
    }

    type = schema.nodes.ordered_list;
    if (type) {
        r.wrapOrderedList = wrapListItem(type);
    }

    type = schema.nodes.blockquote;
    if (type) {
        r.wrapBlockQuote = toItem(wrapItem(type, {}));
    }

    type = schema.nodes.paragraph;
    if (type) {
        r.makeParagraph = toItem(blockTypeItem(type, {}));
    }

    type = schema.nodes.code_block;
    if (type) {
        r.makeCodeBlock = toItem(blockTypeItem(type, {}));
    }

    type = schema.nodes.heading;
    if (type) {
        r.makeHead1 = toItem(blockTypeItem(type, {attrs: {level: 1}}));
        r.makeHead2 = toItem(blockTypeItem(type, {attrs: {level: 2}}));
        r.makeHead3 = toItem(blockTypeItem(type, {attrs: {level: 3}}));
        r.makeHead4 = toItem(blockTypeItem(type, {attrs: {level: 4}}));
        r.makeHead5 = toItem(blockTypeItem(type, {attrs: {level: 5}}));
        r.makeHead6 = toItem(blockTypeItem(type, {attrs: {level: 6}}));
    }

    type = schema.nodes.horizontal_rule;
    if (type) {
        const hr = type;
        r.insertHorizontalRule = new Item({
            enable(state): boolean {
                return canInsert(state, hr);
            },
            run(state, dispatch): void {
                dispatch(state.tr.replaceSelectionWith(hr.create()));
            },
        });
    }

    type = schema.nodes.table;
    if (type) {
        r.insertTable = new Item({run: (e, tr) => addTable(e, tr)});
        r.addColumnBefore = new Item({run: addColumnBefore});
        r.addColumnAfter = new Item({run: addColumnAfter});
        r.deleteColumn = new Item({run: deleteColumn});
        r.addRowBefore = new Item({run: addRowBefore});
        r.addRowAfter = new Item({run: addRowAfter});
        r.deleteRow = new Item({run: deleteRow});
        r.deleteTable = new Item({run: deleteTable});
        r.mergeCells = new Item({run: mergeCells});
        r.splitCell = new Item({run: splitCell});
        r.toggleHeaderColumn = new Item({run: toggleHeaderColumn});
        r.toggleHeaderRow = new Item({run: toggleHeaderRow});
        r.toggleHeaderCell = new Item({run: toggleHeaderCell});
    }

    return r;
}
