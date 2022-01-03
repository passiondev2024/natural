import {marks, nodes} from 'prosemirror-schema-basic';
import {addListNodes} from 'prosemirror-schema-list';
import {Schema} from 'prosemirror-model';

// Keep only basic elements
type BasicNodes = Omit<typeof nodes, 'image' | 'code_block' | 'blockquote' | 'horizontal_rule'>;
const basicNodes: BasicNodes = {
    heading: nodes.heading,
    doc: nodes.doc,
    paragraph: nodes.paragraph,
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

const tmpSchema2 = new Schema({nodes: nodes, marks: basicMarks});

export const advancedSchema = new Schema({
    nodes: addListNodes(tmpSchema2.spec.nodes, 'paragraph block*', 'block'),
    marks: basicMarks,
});
