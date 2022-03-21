import {Node, NodeType} from 'prosemirror-model';
import {AllSelection, EditorState, TextSelection, Transaction} from 'prosemirror-state';
import {Item} from './item';
import {MatDialog} from '@angular/material/dialog';
import {ClassDialogComponent, ClassDialogData} from '../../class-dialog/class-dialog.component';

function setClass(tr: Transaction, classValue: string, allowedNodeType: NodeType): Transaction {
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
        const currentClass = node.attrs.class || null;
        if (currentClass !== classValue && allowedNodeType === nodeType) {
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
            class: classValue ? classValue : null,
        };

        tr = tr.setNodeMarkup(pos, nodeType, newAttrs, node.marks);
    });

    return tr;
}

/**
 * Returns the first `class` attribute that is non-empty in the selection.
 * If not found, return empty string.
 */
function findFirstClassInSelection(state: EditorState, allowedNodeType: NodeType): string {
    const {selection, doc} = state;
    const {from, to} = selection;
    let keepLooking = true;
    let foundClass: string = '';

    doc.nodesBetween(from, to, node => {
        if (keepLooking && node.type === allowedNodeType && node.attrs.class) {
            keepLooking = false;
            foundClass = node.attrs.class;
        }

        return keepLooking;
    });

    return foundClass;
}

export class ClassItem extends Item {
    public constructor(dialog: MatDialog, nodeType: NodeType) {
        super({
            active: state => {
                return !!findFirstClassInSelection(state, nodeType);
            },

            enable: state => {
                const {selection} = state;
                return selection instanceof TextSelection || selection instanceof AllSelection;
            },

            run: (state, dispatch, view): void => {
                dialog
                    .open<ClassDialogComponent, ClassDialogData, ClassDialogData>(ClassDialogComponent, {
                        data: {
                            class: findFirstClassInSelection(state, nodeType),
                        },
                    })
                    .afterClosed()
                    .subscribe(result => {
                        if (dispatch && result) {
                            const {selection} = state;

                            const tr = setClass(state.tr.setSelection(selection), result.class, nodeType);
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
