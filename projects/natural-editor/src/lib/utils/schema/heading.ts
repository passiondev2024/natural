import {Attrs, NodeSpec} from 'prosemirror-model';

type Attributes = {
    class: string;
    id: null | string;
    level: number;
};

const getAttrsForLevel = function (level: number): (node: HTMLElement | string) => Attrs | false | null {
    return (dom: Node | string): null | Attributes => {
        if (!(dom instanceof HTMLElement)) {
            return null;
        }
        const id = dom.getAttribute('id') || null;
        const attrs: Attributes = {level: level, class: dom.className, id: id};

        return attrs;
    };
};

/**
 * A heading textblock, with a `level` attribute that should hold the number 1 to 6,
 * with optional ID and class attributes. Parsed and serialized as `<h1>` to <h6>`
 *
 * https://github.com/ProseMirror/prosemirror-schema-basic/blob/master/src/schema-basic.js
 */
export const heading: NodeSpec = {
    attrs: {
        level: {default: 1},
        class: {default: null},
        id: {default: null},
    },
    content: 'inline*',
    group: 'block',
    defining: true,
    parseDOM: [
        {
            tag: 'h1',
            getAttrs: getAttrsForLevel(1),
        },
        {
            tag: 'h2',
            getAttrs: getAttrsForLevel(2),
        },
        {
            tag: 'h3',
            getAttrs: getAttrsForLevel(3),
        },
        {
            tag: 'h4',
            getAttrs: getAttrsForLevel(4),
        },
        {
            tag: 'h5',
            getAttrs: getAttrsForLevel(5),
        },
        {
            tag: 'h6',
            getAttrs: getAttrsForLevel(6),
        },
    ],
    toDOM: node => {
        const {id} = node.attrs;
        const attrs: {[key: string]: string} = {};

        if (id) {
            attrs.id = id;
        }

        if (node.attrs.class) {
            attrs.class = node.attrs.class;
        }

        return ['h' + node.attrs.level, attrs, 0];
    },
};
