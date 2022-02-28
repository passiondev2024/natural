import {NodeSpec} from 'prosemirror-model';

const ALIGN_PATTERN = /(left|right|center|justify)/;

// https://github.com/ProseMirror/prosemirror-schema-basic/blob/master/src/schema-basic.js
// :: NodeSpec A plain paragraph textblock. Represented in the DOM
// as a `<p>` element.
export const paragraphWithAlignment: NodeSpec = {
    attrs: {
        align: {default: null},
        id: {default: null},
    },
    content: 'inline*',
    group: 'block',
    parseDOM: [
        {
            tag: 'p',
            getAttrs: dom => {
                if (!(dom instanceof HTMLElement)) {
                    return;
                }

                const {textAlign} = dom.style;

                let align: string | null = dom.getAttribute('align') || textAlign || '';
                align = ALIGN_PATTERN.test(align) ? align : null;

                const id = dom.getAttribute('id') || '';

                return {align, id};
            },
        },
    ],
    toDOM: node => {
        const {align, id} = node.attrs;
        const attrs: {[key: string]: any} = {};

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

        return ['p', attrs, 0];
    },
};
