import {NodeSpec} from 'prosemirror-model';

const ALIGN_PATTERN = /(left|right|center|justify)/;
type Attributes = {
    align: null | string;
    class: string;
    id: string;
};

/**
 * A plain paragraph textblock. Represented in the DOM
 * as a `<p>` element.
 *
 * https://github.com/ProseMirror/prosemirror-schema-basic/blob/master/src/schema-basic.js
 */
export const paragraphWithAlignment: NodeSpec = {
    attrs: {
        align: {default: null},
        class: {default: null},
        id: {default: null},
    },
    content: 'inline*',
    group: 'block',
    parseDOM: [
        {
            tag: 'p',
            getAttrs: (dom: Node | string): null | Attributes => {
                if (!(dom instanceof HTMLElement)) {
                    return null;
                }

                const {textAlign} = dom.style;

                let align: string | null = dom.getAttribute('align') || textAlign || '';
                align = ALIGN_PATTERN.test(align) ? align : null;

                const id = dom.getAttribute('id') || '';

                return {align, class: dom.className, id};
            },
        },
    ],
    toDOM: node => {
        const {align, id} = node.attrs;
        const attrs: Record<string, string> = {};

        let style = '';
        if (align && align !== 'left') {
            style += `text-align: ${align};`;
        }

        if (style) {
            attrs.style = style;
        }

        if (id) {
            attrs.id = id;
        }

        if (node.attrs.class) {
            attrs.class = node.attrs.class;
        }

        return ['p', attrs, 0];
    },
};
