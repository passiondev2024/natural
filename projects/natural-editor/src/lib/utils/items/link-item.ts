import {Item} from './item';
import {MarkType} from 'prosemirror-model';
import {MatDialog} from '@angular/material/dialog';
import {EditorState, Transaction} from 'prosemirror-state';
import {EditorView} from 'prosemirror-view';
import {toggleMark} from 'prosemirror-commands';
import {LinkDialogComponent, LinkDialogData} from '../../link-dialog/link-dialog.component';
import {markActive} from './utils';

export class LinkItem extends Item {
    public constructor(markType: MarkType, dialog: MatDialog) {
        super({
            active(state: EditorState): boolean {
                return markActive(state, markType);
            },
            enable(state: EditorState): boolean {
                return !state.selection.empty;
            },
            run(state: EditorState, dispatch: (p: Transaction) => void, view: EditorView): void {
                if (markActive(state, markType)) {
                    toggleMark(markType)(state, dispatch);
                    return;
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
}
