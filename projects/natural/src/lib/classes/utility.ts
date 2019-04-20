import { LiteralExpr } from '@angular/material/node_modules/@angular/compiler';
import { isArray, isEmpty, isObject, pickBy } from 'lodash';
import { Literal } from '../types/types';

export class NaturalUtility {

    /**
     * Relations to full objects are converted to their IDs only.
     *
     * So {user: {id: 123}} becomes {user: 123}
     */
    public static relationsToIds(object: Literal): Literal {
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
    public static cleanSameValues(source: Literal, modified: Literal): Literal {
        Object.keys(source).forEach(key => {
            if (source[key] instanceof Object) {
                this.cleanSameValues(source[key], modified[key]);
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
    public static makePlural(name: string): string {
        const plural = name + 's';

        return plural.replace(/ys$/, 'ies').replace(/ss$/, 'ses').replace(/xs$/, 'xes');
    }

    /**
     * Returns the string with the first letter as capital
     */
    public static upperCaseFirstLetter(term: string): string {
        return term.charAt(0).toUpperCase() + term.slice(1);
    }

    /**
     * Returns the string with the first letter as lower case
     */
    public static lowerCaseFirstLetter(term: string): string {
        return term.charAt(0).toLowerCase() + term.slice(1);
    }

    /**
     * Replace all attributes of first object with the ones provided by the second, but keeps the reference
     */
    public static replaceObjectKeepingReference(obj, newObj) {

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
    public static getForegroundColor(hexBgColor: string): 'black' | 'white' {
        const rgb = NaturalUtility.hexToRgb(hexBgColor.slice(0, 7)); // splice remove alpha and consider only "visible" color at 100% alpha
        const o = Math.round(((rgb.r * 299) + (rgb.g * 587) + (rgb.b * 114)) / 1000);

        return (o > 125) ? 'black' : 'white';
    }

    public static hexToRgb(hex: string): { r: number, g: number, b: number } {
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

}
