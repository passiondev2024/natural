import { isString } from 'lodash';
import { NaturalSearchSelections } from '../types/Values';
import { deepClone } from './utils';

/**
 * Returns a string representation of the selection that can be used in URL.
 *
 * The string can be parsed back with `fromUrl()`
 */
export function toUrl(selections: NaturalSearchSelections | null): string | null {
    if (!selections || !selections.length) {
        return null;
    }

    const s = deepClone(selections);
    for (const a of s) {
        for (const b of a) {
            b['f'] = b.field;
            b['c'] = b.condition;

            delete b.field;
            delete b.condition;
        }
    }

    const result = JSON.stringify(s);

    return result === '[[]]' ? null : result;
}

/**
 * Parse a string, probably coming from URL, into a selection
 */
export function fromUrl(selections: string | null): NaturalSearchSelections {

    if (!selections || !selections.length) {
        return [[]];
    }

    const result = JSON.parse(selections) as NaturalSearchSelections;

    for (const a of result) {
        for (const b of a) {
            b.field = b['f'];
            b.condition = b['c'];

            delete b['f'];
            delete b['c'];
        }
    }

    if (result.length === 0) {
        result.push([]);
    }

    return result;
}
