import {EditorState, Transaction} from 'prosemirror-state';
import {setCellAttr} from 'prosemirror-tables';
import {EditorView} from 'prosemirror-view';
import {Item} from './item';
import {MatDialog} from '@angular/material/dialog';
import {ColorDialogComponent, ColorDialogData} from '../../color-dialog/color-dialog.component';

const setCellBackgroundColor = setCellAttr.bind(null, 'background');

export class CellBackgroundColorItem extends Item {
    public constructor(dialog: MatDialog) {
        super({
            enable(state: EditorState): boolean {
                const cmd = setCellBackgroundColor('#000000');

                return cmd(state);
            },
            run(state: EditorState, dispatch: (p: Transaction) => void, view: EditorView): void {
                dialog
                    .open<ColorDialogComponent, ColorDialogData, ColorDialogData>(ColorDialogComponent, {
                        data: {
                            color: '',
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
