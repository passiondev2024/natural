import { isObject } from 'lodash';
import { Literal } from '../types/types';

/**
 * Replace native toJSON() function by our own implementation that will preserve the local time zone.
 * This allow the server side to know the day (without time) that was selected on client side.
 */
function replaceToJSON(date: Date): void {

    date.toJSON = (): string => {
        const timezoneOffsetInHours = -(date.getTimezoneOffset() / 60); // UTC minus local time
        const sign = timezoneOffsetInHours >= 0 ? '+' : '-';
        const leadingZero = (Math.abs(timezoneOffsetInHours) < 10) ? '0' : '';
        const offsetMinutes = date.getTimezoneOffset() % 60;
        const leadingZeroMinutes = (offsetMinutes < 10) ? '0' : '';

        // It's a bit unfortunate that we need to construct a new Date instance
        // (we don't want _this_ Date instance to be modified)
        const correctedDate = new Date(date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            date.getHours(),
            date.getMinutes(),
            date.getSeconds(),
            date.getMilliseconds());
        correctedDate.setHours(date.getHours() + timezoneOffsetInHours);

        const iso = correctedDate.toISOString().replace(/\.\d{3}Z/, '').replace('Z', '');

        return iso + sign + leadingZero + Math.abs(timezoneOffsetInHours).toString() + ':' + leadingZeroMinutes + offsetMinutes;
    };
}

function isFile(value): boolean {
    return (typeof File !== 'undefined' && value instanceof File) ||
           (typeof Blob !== 'undefined' && value instanceof Blob) ||
           (typeof FileList !== 'undefined' && value instanceof FileList);
}

/**
 * Detect if the given variables has a file to be uploaded or not, and
 * also convert date to be serialized with their timezone.
 */
export function hasFilesAndProcessDate(variables: Literal): boolean {
    let fileFound = false;
    if (!isObject(variables)) {
        return false;
    }

    Object.keys(variables).forEach(key => {
        const value = variables[key];

        if (value instanceof Date) {
            replaceToJSON(value);
        }

        if (isFile(value)) {
            fileFound = true;
        }

        if (hasFilesAndProcessDate(value)) {
            fileFound = true;
        }
    });

    return fileFound;
}
