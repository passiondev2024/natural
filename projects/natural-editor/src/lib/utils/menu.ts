import {
    blockTypeItem,
    joinUpItem,
    liftItem,
    MenuItem,
    redoItem,
    selectParentNodeItem,
    undoItem,
    wrapItem,
} from 'prosemirror-menu';
import {MarkType, NodeType, Schema} from 'prosemirror-model';
import {MatDialog} from '@angular/material/dialog';
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
import {Item} from './items/item';
import {paragraphWithAlignment} from './paragraph-with-alignment';
import {TextAlignItem} from './items/text-align-item';
import {CellBackgroundColorItem} from './items/cell-background-color-item';
import {LinkItem} from './items/link-item';
import {HorizontalRuleItem} from './items/horizontal-rule-item';
import {cmdToItem, markTypeToItem, menuItemToItem} from './items/utils';
import {wrapListItem} from './items/wrap-list-item';
import {ClassItem} from './items/class-item';
import {AddTableItem} from './items/table-item';

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
    | 'alignLeft'
    | 'alignRight'
    | 'alignCenter'
    | 'alignJustify'
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
    | 'toggleHeaderCell'
    | 'cellBackgroundColor'
    | 'tableClass'
    | 'paragraphClass';

export type MenuItems = Partial<Record<Key, Item>>;

/**
 * Given a schema, look for default mark and node types in it and
 * return an object with relevant menu items relating to those marks:
 */
export function buildMenuItems(schema: Schema, dialog: MatDialog): MenuItems {
    const r: MenuItems = {
        joinUp: menuItemToItem(joinUpItem),
        lift: menuItemToItem(liftItem),
        selectParentNode: menuItemToItem(selectParentNodeItem),
        undo: menuItemToItem(undoItem as unknown as MenuItem), // Typing is incorrect, so we force it
        redo: menuItemToItem(redoItem as unknown as MenuItem),
    };

    let type: MarkType | NodeType | undefined;
    type = schema.marks.strong;
    if (type) {
        r.toggleStrong = markTypeToItem(type);
    }

    type = schema.marks.em;
    if (type) {
        r.toggleEm = markTypeToItem(type);
    }

    type = schema.marks.code;
    if (type) {
        r.toggleCode = markTypeToItem(type);
    }

    type = schema.marks.link;
    if (type) {
        r.toggleLink = new LinkItem(type, dialog);
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
        r.wrapBlockQuote = menuItemToItem(wrapItem(type, {}));
    }

    type = schema.nodes.paragraph;
    if (type) {
        r.makeParagraph = menuItemToItem(blockTypeItem(type, {}));

        if (type.spec === paragraphWithAlignment) {
            r.alignLeft = new TextAlignItem('left');
            r.alignRight = new TextAlignItem('right');
            r.alignCenter = new TextAlignItem('center');
            r.alignJustify = new TextAlignItem('justify');
            r.paragraphClass = new ClassItem(dialog, type);
        }
    }

    type = schema.nodes.code_block;
    if (type) {
        r.makeCodeBlock = menuItemToItem(blockTypeItem(type, {}));
    }

    type = schema.nodes.heading;
    if (type) {
        r.makeHead1 = menuItemToItem(blockTypeItem(type, {attrs: {level: 1}}));
        r.makeHead2 = menuItemToItem(blockTypeItem(type, {attrs: {level: 2}}));
        r.makeHead3 = menuItemToItem(blockTypeItem(type, {attrs: {level: 3}}));
        r.makeHead4 = menuItemToItem(blockTypeItem(type, {attrs: {level: 4}}));
        r.makeHead5 = menuItemToItem(blockTypeItem(type, {attrs: {level: 5}}));
        r.makeHead6 = menuItemToItem(blockTypeItem(type, {attrs: {level: 6}}));
    }

    type = schema.nodes.horizontal_rule;
    if (type) {
        r.insertHorizontalRule = new HorizontalRuleItem(type);
    }

    type = schema.nodes.table;
    if (type) {
        r.insertTable = new AddTableItem();
        r.addColumnBefore = cmdToItem(addColumnBefore);
        r.addColumnAfter = cmdToItem(addColumnAfter);
        r.deleteColumn = cmdToItem(deleteColumn);
        r.addRowBefore = cmdToItem(addRowBefore);
        r.addRowAfter = cmdToItem(addRowAfter);
        r.deleteRow = cmdToItem(deleteRow);
        r.deleteTable = cmdToItem(deleteTable);
        r.mergeCells = cmdToItem(mergeCells);
        r.splitCell = cmdToItem(splitCell);
        r.toggleHeaderColumn = cmdToItem(toggleHeaderColumn);
        r.toggleHeaderRow = cmdToItem(toggleHeaderRow);
        r.toggleHeaderCell = cmdToItem(toggleHeaderCell);
        r.cellBackgroundColor = new CellBackgroundColorItem(dialog);
        r.tableClass = new ClassItem(dialog, type);
    }

    return r;
}
