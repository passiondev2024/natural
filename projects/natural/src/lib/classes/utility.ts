import { isArray, isEmpty, isObject, pickBy } from 'lodash';
import { Literal } from '../types/types';

/**
 * Very basic formatting to get only date, without time and ignoring entirely the timezone
 */
export function formatIsoDate(date: Date | null): string | null {
    if (!date) {
        return null;
    }

    const y = date.getFullYear();
    const m = date.getMonth() + 1;
    const d = date.getDate();

    return y
        + '-'
        + (m < 10 ? '0' : '') + m
        + '-'
        + (d < 10 ? '0' : '') + d;
}

/**
 * Relations to full objects are converted to their IDs only.
 *
 * So {user: {id: 123}} becomes {user: 123}
 */
export function relationsToIds(object: Literal): Literal {
    const newObj = {};
    Object.keys(object).forEach((key) => {
        let value: string | Literal = object[key];
        if (isObject(value) && value.id) {
            value = value.id;
        } else if (isArray(value)) {
            value = value.map((i: string | Literal) => isObject(i) && i.id ? i.id : i);
        } else if (isObject(value) && !(value instanceof File) && !(value instanceof Date)) {
            value = pickBy(value, (v, k) => k !== '__typename'); // omit(value, ['__typename']) ?
        }

        newObj[key] = value;
    });

    return newObj;
}

/**
 * Remove from source object the attributes with same value as modified
 * Does not consider arrays
 */
export function cleanSameValues(source: Literal, modified: Literal): Literal {
    Object.keys(source).forEach(key => {
        if (source[key] instanceof Object) {
            cleanSameValues(source[key], modified[key]);
            if (isEmpty(source[key])) {
                delete source[key];
            }
        } else if (modified && source[key] === modified[key]) {
            delete source[key];
        }
    });

    return source;
}

/**
 * Returns the plural form of the given name
 */
export function makePlural(name: string): string {
    const plural = name + 's';

    return plural.replace(/ys$/, 'ies').replace(/ss$/, 'ses').replace(/xs$/, 'xes');
}

/**
 * Returns the string with the first letter as capital
 */
export function upperCaseFirstLetter(term: string): string {
    return term.charAt(0).toUpperCase() + term.slice(1);
}

/**
 * Returns the string with the first letter as lower case
 */
export function lowerCaseFirstLetter(term: string): string {
    return term.charAt(0).toLowerCase() + term.slice(1);
}

/**
 * Replace all attributes of first object with the ones provided by the second, but keeps the reference
 */
export function replaceObjectKeepingReference(obj, newObj) {

    if (!obj || !newObj) {
        return;
    }

    Object.keys(obj).forEach((key) => {
        delete obj[key];
    });

    Object.keys(newObj).forEach((key) => {
        obj[key] = newObj[key];
    });

}

/**
 * Get contrasted color for text in the slider thumb
 * @param hexBgColor string in hexadecimals representing the background color
 */
export function getForegroundColor(hexBgColor: string): 'black' | 'white' {
    const rgb = hexToRgb(hexBgColor.slice(0, 7)); // splice remove alpha and consider only "visible" color at 100% alpha
    const o = Math.round(((rgb.r * 299) + (rgb.g * 587) + (rgb.b * 114)) / 1000);

    return (o > 125) ? 'black' : 'white';
}

function hexToRgb(hex: string): { r: number, g: number, b: number } {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => {
        return r + r + g + g + b + b;
    });

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
    } : {
        r: 0,
        g: 0,
        b: 0,
    };
}

/**
 * During lodash.mergeWith, overrides arrays
 */
export function mergeOverrideArray(destValue: any, source: any): any {
    if (isArray(source)) {
        return source;
    }
}
