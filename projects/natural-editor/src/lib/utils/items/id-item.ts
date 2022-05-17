import {Node, NodeType} from 'prosemirror-model';
import {AllSelection, EditorState, TextSelection, Transaction} from 'prosemirror-state';
import {Item} from './item';
import {MatDialog} from '@angular/material/dialog';
import {IdDialogComponent, IdDialogData} from '../../id-dialog/id-dialog.component';

function setId(tr: Transaction, idValue: string, allowedNodeType: NodeType): Transaction {
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
        if (currentId !== idValue && allowedNodeType === nodeType) {
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
function findFirstIdInSelection(state: EditorState, allowedNodeType: NodeType): string {
    const {selection, doc} = state;
    const {from, to} = selection;
    let keepLooking = true;
    let foundClass: string = '';

    doc.nodesBetween(from, to, node => {
        if (keepLooking && node.type === allowedNodeType && node.attrs.id) {
            keepLooking = false;
            foundClass = node.attrs.id;
        }

        return keepLooking;
    });

    return foundClass;
}

export class IdItem extends Item {
    public constructor(dialog: MatDialog, nodeType: NodeType) {
        super({
            active: state => {
                return !!findFirstIdInSelection(state, nodeType);
            },

            enable: state => {
                const {selection} = state;
                return selection instanceof TextSelection || selection instanceof AllSelection;
            },

            run: (state, dispatch, view): void => {
                dialog
                    .open<IdDialogComponent, IdDialogData, IdDialogData>(IdDialogComponent, {
                        data: {
                            id: findFirstIdInSelection(state, nodeType),
                        },
                    })
                    .afterClosed()
                    .subscribe(result => {
                        if (dispatch && result) {
                            const {selection} = state;

                            const tr = setId(state.tr.setSelection(selection), result.id, nodeType);
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
