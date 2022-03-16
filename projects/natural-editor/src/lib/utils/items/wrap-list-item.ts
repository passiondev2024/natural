import {NodeType} from 'prosemirror-model';
import {Item} from './item';
import {wrapInList} from 'prosemirror-schema-list';
import {cmdToItem} from './utils';

export function wrapListItem(nodeType: NodeType): Item {
    return cmdToItem(wrapInList(nodeType));
}
