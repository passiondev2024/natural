import {marks, nodes} from 'prosemirror-schema-basic';
import {addListNodes} from 'prosemirror-schema-list';
import {Schema} from 'prosemirror-model';

// Keep only basic elements
type BasicNodes = Omit<typeof nodes, 'image' | 'code_block' | 'blockquote' | 'horizontal_rule'>;
const myNodes: BasicNodes = {
    heading: nodes.heading,
    doc: nodes.doc,
    paragraph: nodes.paragraph,
    text: nodes.text,
    hard_break: nodes.hard_break,
};

type BasicMarks = Omit<typeof marks, 'code'>;
const myMarks: BasicMarks = {
    link: marks.link,
    em: marks.em,
    strong: marks.strong,
};

const basicSchema = new Schema({nodes: myNodes, marks: myMarks});

export const schema = new Schema({
    nodes: addListNodes(basicSchema.spec.nodes as any, 'paragraph block*', 'block'),
    marks: basicSchema.spec.marks,
});
