import {EditorState, TextSelection, Transaction} from 'prosemirror-state';
import {Fragment, Node as ProsemirrorNode, NodeType} from 'prosemirror-model';
import {tableNodeTypes} from 'prosemirror-tables';
import {Item} from './item';

function createCell(
    cellType: NodeType,
    cellContent?: Fragment | ProsemirrorNode | Array<ProsemirrorNode>,
): ProsemirrorNode<any> | null | undefined {
    return cellContent ? cellType.createChecked(null, cellContent) : cellType.createAndFill();
}

function createTable(
    state: EditorState,
    rowsCount: number,
    colsCount: number,
    withHeaderRow: boolean,
    cellContent?: Fragment | ProsemirrorNode | Array<ProsemirrorNode>,
): ProsemirrorNode {
    const types = tableNodeTypes(state.schema);
    const headerCells = [];
    const cells = [];

    for (let index = 0; index < colsCount; index += 1) {
        const cell = createCell(types.cell, cellContent);

        if (cell) {
            cells.push(cell);
        }

        if (withHeaderRow) {
            const headerCell = createCell(types.header_cell, cellContent);

            if (headerCell) {
                headerCells.push(headerCell);
            }
        }
    }

    const rows = [];

    for (let index = 0; index < rowsCount; index += 1) {
        rows.push(types.row.createChecked(null, withHeaderRow && index === 0 ? headerCells : cells));
    }

    return types.table.createChecked(null, rows);
}

function addTable(
    state: EditorState,
    dispatch?: (tr: Transaction) => void,
    {
        rowsCount = 3,
        colsCount = 3,
        withHeaderRow = true,
        cellContent,
    }: {
        rowsCount?: number;
        colsCount?: number;
        withHeaderRow?: boolean;
        cellContent?: Fragment | ProsemirrorNode | Array<ProsemirrorNode>;
    } = {},
): void {
    const offset = state.tr.selection.anchor + 1;

    const nodes = createTable(state, rowsCount, colsCount, withHeaderRow, cellContent);
    const tr = state.tr.replaceSelectionWith(nodes).scrollIntoView();
    const resolvedPos = tr.doc.resolve(offset);

    // move cursor into table
    tr.setSelection(TextSelection.near(resolvedPos));

    dispatch?.(tr);
}

export class AddTableItem extends Item {
    public constructor() {
        super({run: (editor, tr) => addTable(editor, tr)});
    }
}
