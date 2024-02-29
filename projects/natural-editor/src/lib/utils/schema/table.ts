import {MutableAttrs, TableNodes, TableNodesOptions} from 'prosemirror-tables';
import {Attrs, Node as ProsemirrorNode} from 'prosemirror-model';

type CellAttributes = TableNodesOptions['cellAttributes'];

function getCellAttrs(dom: Node | string, extraAttrs: CellAttributes): null | Attrs {
    if (!(dom instanceof HTMLElement)) {
        return null;
    }

    const widthAttr = dom.getAttribute('data-colwidth');
    const widths = widthAttr && /^\d+(,\d+)*$/.test(widthAttr) ? widthAttr.split(',').map(s => Number(s)) : null;
    const colspan = Number(dom.getAttribute('colspan') || 1);
    const result: MutableAttrs = {
        colspan,
        rowspan: Number(dom.getAttribute('rowspan') || 1),
        colwidth: widths && widths.length == colspan ? widths : null,
    };

    for (const prop in extraAttrs) {
        const getter = extraAttrs[prop].getFromDOM;
        const value = getter?.(dom);
        if (value != null) result[prop] = value;
    }

    return result;
}

function setCellAttrs(node: ProsemirrorNode, extraAttrs: CellAttributes): undefined | Record<string, string> {
    const attrs: Record<string, string> = {};
    if (node.attrs.colspan != 1) attrs.colspan = node.attrs.colspan;
    if (node.attrs.rowspan != 1) attrs.rowspan = node.attrs.rowspan;
    if (node.attrs.colwidth) attrs['data-colwidth'] = node.attrs.colwidth.join(',');

    for (const prop in extraAttrs) {
        const setter = extraAttrs[prop].setDOMAttr;
        if (setter) setter(node.attrs[prop], attrs);
    }

    return attrs;
}

/**
 * This function creates a set of [node
 * specs](http://prosemirror.net/docs/ref/#model.SchemaSpec.nodes) for
 * `table`, `table_row`, and `table_cell` nodes types.
 *
 * It is very directly inspired by prosemirror-table
 */
export function tableNodes(options: TableNodesOptions): TableNodes {
    const extraAttrs = options.cellAttributes || {};
    const cellAttrs: CellAttributes = {
        colspan: {default: 1},
        rowspan: {default: 1},
        colwidth: {default: null},
    };

    for (const prop in extraAttrs) {
        cellAttrs[prop] = {
            default: extraAttrs[prop].default,
        };
    }

    return {
        table: {
            attrs: {
                class: {default: null},
                id: {default: ''},
            },
            content: 'table_row+',
            tableRole: 'table',
            isolating: true,
            group: options.tableGroup,
            parseDOM: [
                {
                    tag: 'table',
                    getAttrs: (dom: Node | string): null | Attrs => {
                        if (!(dom instanceof HTMLElement)) {
                            return null;
                        }

                        return {
                            class: dom.className,
                            id: dom.id,
                        };
                    },
                },
            ],
            toDOM: node => {
                const attrs: Record<string, string> = {};
                if (node.attrs.class) {
                    attrs.class = node.attrs.class;
                }
                if (node.attrs.id) {
                    attrs.id = node.attrs.id;
                }

                return ['table', attrs, ['tbody', 0]];
            },
        },
        table_row: {
            content: '(table_cell | table_header)*',
            tableRole: 'row',
            parseDOM: [{tag: 'tr'}],
            toDOM: () => {
                return ['tr', 0];
            },
        },
        table_cell: {
            content: options.cellContent,
            attrs: cellAttrs,
            tableRole: 'cell',
            isolating: true,
            parseDOM: [{tag: 'td', getAttrs: dom => getCellAttrs(dom, extraAttrs)}],
            toDOM: node => {
                return ['td', setCellAttrs(node, extraAttrs), 0];
            },
        },
        table_header: {
            content: options.cellContent,
            attrs: cellAttrs,
            tableRole: 'header_cell',
            isolating: true,
            parseDOM: [{tag: 'th', getAttrs: dom => getCellAttrs(dom, extraAttrs)}],
            toDOM: node => {
                return ['th', setCellAttrs(node, extraAttrs), 0];
            },
        },
    };
}
