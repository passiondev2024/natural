import {isArray, isEmpty, pickBy} from 'lodash-es';
import {Literal} from '../types/types';
import type {ReadonlyDeep} from 'type-fest';

/**
 * Very basic formatting to get only date, without time and ignoring entirely the timezone
 *
 * So something like: "2021-09-23"
 */
export function formatIsoDate(date: null): null;
export function formatIsoDate(date: Date): string;
export function formatIsoDate(date: Date | null): string | null;
export function formatIsoDate(date: Date | null): string | null {
    if (!date) {
        return null;
    }

    const y = date.getFullYear();
    const m = date.getMonth() + 1;
    const d = date.getDate();

    return y + '-' + (m < 10 ? '0' : '') + m + '-' + (d < 10 ? '0' : '') + d;
}

/**
 * Format a date and time in a way that will preserve the local time zone.
 * This allows the server side to know the day (without time) that was selected on client side.
 *
 * So something like: "2021-09-23T17:57:16+09:00"
 */
export function formatIsoDateTime(date: Date): string {
    const timezoneOffsetInMinutes = date.getTimezoneOffset();
    const timezoneOffsetInHours = -Math.trunc(timezoneOffsetInMinutes / 60); // UTC minus local time
    const sign = timezoneOffsetInHours >= 0 ? '+' : '-';
    const hoursLeadingZero = Math.abs(timezoneOffsetInHours) < 10 ? '0' : '';
    const remainderMinutes = -(timezoneOffsetInMinutes % 60);
    const minutesLeadingZero = Math.abs(remainderMinutes) < 10 ? '0' : '';

    // It's a bit unfortunate that we need to construct a new Date instance,
    // but we don't want the original Date instance to be modified
    const correctedDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        date.getHours(),
        date.getMinutes(),
        date.getSeconds(),
        date.getMilliseconds(),
    );
    correctedDate.setHours(date.getHours() + timezoneOffsetInHours);

    const iso = correctedDate
        .toISOString()
        .replace(/\.\d{3}Z/, '')
        .replace('Z', '');

    return (
        iso +
        sign +
        hoursLeadingZero +
        Math.abs(timezoneOffsetInHours).toString() +
        ':' +
        minutesLeadingZero +
        remainderMinutes
    );
}

/**
 * Relations to full objects are converted to their IDs only.
 *
 * So {user: {id: 123}} becomes {user: 123}
 */
export function relationsToIds(object: Literal): Literal {
    const newObj: Literal = {};
    Object.keys(object).forEach(key => {
        let value: unknown = object[key];

        if (value === null || value === undefined) {
            // noop
        } else if (hasId(value)) {
            value = value.id;
        } else if (isArray(value)) {
            value = value.map((i: unknown) => (hasId(i) ? i.id : i));
        } else if (typeof value === 'object' && !(value instanceof File) && !(value instanceof Date)) {
            value = pickBy(value, (v, k) => k !== '__typename'); // omit(value, ['__typename']) ?
        }

        newObj[key] = value;
    });

    return newObj;
}

function hasId(value: unknown): value is {id: unknown} {
    return !!value && typeof value === 'object' && 'id' in value && !!value.id;
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
export function replaceObjectKeepingReference(obj: Literal | null, newObj: Literal | null): void {
    if (!obj || !newObj) {
        return;
    }

    Object.keys(obj).forEach(key => {
        delete obj[key];
    });

    Object.keys(newObj).forEach(key => {
        obj[key] = newObj[key];
    });
}

/**
 * Get contrasted color for text in the slider thumb
 * @param hexBgColor string in hexadecimals representing the background color
 */
export function getForegroundColor(hexBgColor: string): 'black' | 'white' {
    const rgb = hexToRgb(hexBgColor.slice(0, 7)); // splice remove alpha and consider only "visible" color at 100% alpha
    const o = Math.round((rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000);

    return o > 125 ? 'black' : 'white';
}

function hexToRgb(hex: string): {r: number; g: number; b: number} {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => {
        return r + r + g + g + b + b;
    });

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16),
          }
        : {
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

/**
 * Copy text to clipboard.
 * Accepts line breaks `\n` as textarea do.
 */
export function copyToClipboard(document: Document, text: string): void {
    const input = document.createElement('textarea');
    document.body.append(input);
    input.value = text;
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
}

export function deepFreeze<T extends Literal>(o: T): ReadonlyDeep<T> {
    Object.values(o).forEach(v => Object.isFrozen(v) || deepFreeze(v));

    return Object.freeze(o) as ReadonlyDeep<T>;
}
