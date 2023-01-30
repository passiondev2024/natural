import {EditorState, Transaction} from 'prosemirror-state';
import {CellSelection, isInTable, selectionCell, setCellAttr} from 'prosemirror-tables';
import {EditorView} from 'prosemirror-view';
import {Item} from './item';
import {MatLegacyDialog as MatDialog} from '@angular/material/legacy-dialog';
import {ColorDialogComponent, ColorDialogData} from '../../color-dialog/color-dialog.component';

const setCellBackgroundColor = setCellAttr.bind(null, 'background');

function findFirstClassInSelection(state: EditorState): string {
    if (!isInTable(state)) {
        return '';
    }

    // For single cell selection
    const $cell = selectionCell(state);
    let foundColor: string = $cell?.nodeAfter?.attrs.background ?? '';
    if (foundColor) {
        return foundColor;
    }

    // For multiple cells selection
    let keepLooking = true;
    if (state.selection instanceof CellSelection) {
        state.selection.forEachCell(node => {
            const color = node.attrs.background;
            if (keepLooking && color) {
                keepLooking = false;
                foundColor = color;
            }
        });
    }

    return foundColor;
}

export class CellBackgroundColorItem extends Item {
    public constructor(dialog: MatDialog) {
        super({
            enable(state: EditorState): boolean {
                // Pretend to set a unique color that is not already set, to test if we can any color at all
                const cmd = setCellBackgroundColor('#000001');

                return cmd(state);
            },
            run(state: EditorState, dispatch: (p: Transaction) => void, view: EditorView): void {
                dialog
                    .open<ColorDialogComponent, ColorDialogData, ColorDialogData>(ColorDialogComponent, {
                        data: {
                            color: findFirstClassInSelection(state),
                        },
                    })
                    .afterClosed()
                    .subscribe(result => {
                        if (dispatch && result) {
                            const cmd = setCellBackgroundColor(result.color);
                            cmd(state, dispatch);
                        }

                        view.focus();
                    });
            },
        });
    }
}
