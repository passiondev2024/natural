import {Decoration, DecorationSet, EditorView} from 'prosemirror-view';
import {EditorState, Plugin} from 'prosemirror-state';
import {Observable} from 'rxjs';
import {Schema} from 'prosemirror-model';
import {Inject, Injectable} from '@angular/core';
import {DOCUMENT} from '@angular/common';

export type ImageUploader = (file: File) => Observable<string>;

@Injectable()
export class ImagePlugin {
    public readonly plugin: Plugin<DecorationSet>;

    public constructor(@Inject(DOCUMENT) private readonly document: Document) {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this;
        this.plugin = new Plugin<DecorationSet>({
            state: {
                init(): DecorationSet {
                    return DecorationSet.empty;
                },
                apply(tr, set): DecorationSet {
                    // Adjust decoration positions to changes made by the transaction
                    set = set.map(tr.mapping, tr.doc);

                    // See if the transaction adds or removes any placeholders
                    const action = tr.getMeta(self.plugin);
                    if (action && action.add) {
                        const widget = document.createElement('placeholder');
                        const deco = Decoration.widget(action.add.pos, widget, {id: action.add.id});
                        set = set.add(tr.doc, [deco]);
                    } else if (action && action.remove) {
                        set = set.remove(set.find(undefined, undefined, spec => spec.id === action.remove.id));
                    }

                    return set;
                },
            },
            props: {
                decorations(state): DecorationSet {
                    return this.getState(state);
                },
            },
        });
    }

    private findPlaceholder(state: EditorState, id: Record<string, never>): number | null {
        const decorators = this.plugin.getState(state);
        const found = decorators?.find(undefined, undefined, spec => spec.id === id);
        return found?.length ? found[0].from : null;
    }

    public startImageUpload(view: EditorView, file: File, uploader: ImageUploader, schema: Schema): void {
        // A fresh object to act as the ID for this upload
        const id = {};

        // Replace the selection with a placeholder
        const tr = view.state.tr;
        if (!tr.selection.empty) {
            tr.deleteSelection();
        }

        tr.setMeta(this.plugin, {add: {id, pos: tr.selection.from}});
        view.dispatch(tr);

        uploader(file).subscribe({
            next: url => {
                const pos = this.findPlaceholder(view.state, id);
                // If the content around the placeholder has been deleted, drop
                // the image
                if (pos === null) {
                    return;
                }

                // Otherwise, insert it at the placeholder's position, and remove
                // the placeholder
                view.dispatch(
                    view.state.tr
                        .replaceWith(pos, pos, schema.nodes.image.create({src: url}))
                        .setMeta(this.plugin, {remove: {id}}),
                );
            },
            error: () => {
                // On failure, just clean up the placeholder
                view?.dispatch(tr.setMeta(this.plugin, {remove: {id}}));
            },
        });
    }
}
