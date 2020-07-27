import {NaturalSearchSelections} from '../types/values';
import {deepClone} from './utils';
import {Literal} from '../../../types/types';

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
            (b as Literal)['f'] = b.field;
            (b as Literal)['c'] = b.condition;

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
            b.field = (b as Literal)['f'];
            b.condition = (b as Literal)['c'];

            delete (b as Literal)['f'];
            delete (b as Literal)['c'];
        }
    }

    if (result.length === 0) {
        result.push([]);
    }

    return result;
}
