import {Item} from './item';
import {EditorState} from 'prosemirror-state';
import {NodeType} from 'prosemirror-model';

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

export class HorizontalRuleItem extends Item {
    public constructor(hr: NodeType) {
        super({
            enable(state): boolean {
                return canInsert(state, hr);
            },
            run(state, dispatch): void {
                dispatch(state.tr.replaceSelectionWith(hr.create()));
            },
        });
    }
}
