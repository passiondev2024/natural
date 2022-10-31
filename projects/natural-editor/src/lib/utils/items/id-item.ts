import {Node, NodeType} from 'prosemirror-model';
import {AllSelection, EditorState, TextSelection, Transaction} from 'prosemirror-state';
import {Item} from './item';
import {selectionContainsNodeType} from './utils';
import {MatDialog} from '@angular/material/dialog';
import {IdDialogComponent, IdDialogData} from '../../id-dialog/id-dialog.component';

function setId(tr: Transaction, idValue: string, allowedNodeTypes: string[]): Transaction {
    const {selection, doc} = tr;
    if (!selection || !doc) {
        return tr;
    }
    const {from, to} = selection;

    const tasks: {
        node: Node;
        pos: number;
        nodeType: NodeType;
    }[] = [];

    doc.nodesBetween(from, to, (node, pos) => {
        const nodeType = node.type;
        const currentId = node.attrs.id || null;
        if (currentId !== idValue && allowedNodeTypes.includes(nodeType.name)) {
            tasks.push({
                node,
                pos,
                nodeType,
            });
        }
        return true;
    });

    if (!tasks.length) {
        return tr;
    }

    tasks.forEach(job => {
        const {node, pos, nodeType} = job;
        const newAttrs = {
            ...node.attrs,
            id: idValue ? idValue : null,
        };

        tr = tr.setNodeMarkup(pos, nodeType, newAttrs, node.marks);
    });

    return tr;
}

/**
 * Returns the first `id` attribute that is non-empty in the selection.
 * If not found, return empty string.
 */
function findFirstIdInSelection(state: EditorState, allowedNodeTypes: string[]): string {
    const {selection, doc} = state;
    const {from, to} = selection;
    let keepLooking = true;
    let foundId: string = '';

    doc.nodesBetween(from, to, node => {
        if (keepLooking && allowedNodeTypes.includes(node.type.name) && node.attrs.id) {
            keepLooking = false;
            foundId = node.attrs.id;
        }

        return keepLooking;
    });

    return foundId;
}

export class IdItem extends Item {
    public constructor(dialog: MatDialog, nodeTypes: string[]) {
        super({
            active: state => {
                return !!findFirstIdInSelection(state, nodeTypes);
            },

            enable: state => {
                return selectionContainsNodeType(state, nodeTypes);
            },

            run: (state, dispatch, view): void => {
                dialog
                    .open<IdDialogComponent, IdDialogData, IdDialogData>(IdDialogComponent, {
                        data: {
                            id: findFirstIdInSelection(state, nodeTypes),
                        },
                    })
                    .afterClosed()
                    .subscribe(result => {
                        if (dispatch && result) {
                            const {selection} = state;

                            const tr = setId(state.tr.setSelection(selection), result.id, nodeTypes);
                            if (tr.docChanged) {
                                dispatch?.(tr);
                            }
                        }

                        view.focus();
                    });
            },
        });
    }
}
