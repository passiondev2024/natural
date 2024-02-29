import {marks, nodes} from 'prosemirror-schema-basic';
import {addListNodes} from 'prosemirror-schema-list';
import {Schema} from 'prosemirror-model';
import {paragraphWithAlignment} from './paragraph-with-alignment';
import {heading} from './heading';
import {tableNodes} from './table';

// Keep only basic elements
type BasicNodes = Omit<typeof nodes, 'image' | 'code_block' | 'blockquote' | 'horizontal_rule'>;
const basicNodes: BasicNodes = {
    doc: nodes.doc,
    paragraph: nodes.paragraph,
    heading: nodes.heading,
    text: nodes.text,
    hard_break: nodes.hard_break,
};

type BasicMarks = Omit<typeof marks, 'code'>;
const basicMarks: BasicMarks = {
    link: marks.link,
    em: marks.em,
    strong: marks.strong,
};

const tmpSchema = new Schema({nodes: basicNodes, marks: basicMarks});

export const basicSchema = new Schema({
    nodes: addListNodes(tmpSchema.spec.nodes, 'paragraph block*', 'block'),
    marks: tmpSchema.spec.marks,
});

const tmpSchema2 = new Schema({
    nodes: {
        ...nodes,
        heading: heading,
        ...tableNodes({
            tableGroup: 'block',
            cellContent: 'block+',
            cellAttributes: {
                background: {
                    default: null,
                    getFromDOM(dom) {
                        return dom.style.backgroundColor || null;
                    },
                    setDOMAttr(value, attrs) {
                        if (typeof value === 'string' && value) {
                            attrs.style = ((attrs.style as string) || '') + `background-color: ${value};`;
                        }
                    },
                },
            },
        }),
        paragraph: paragraphWithAlignment,
    },
    marks: basicMarks,
});

export const advancedSchema = new Schema({
    nodes: addListNodes(tmpSchema2.spec.nodes, 'paragraph block*', 'block'),
    marks: basicMarks,
});
