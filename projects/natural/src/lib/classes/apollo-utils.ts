import {isObject} from 'lodash-es';
import {Literal} from '../types/types';
import {formatIsoDateTime} from './utility';

function isFile(value: any): boolean {
    return (
        (typeof File !== 'undefined' && value instanceof File) ||
        (typeof Blob !== 'undefined' && value instanceof Blob) ||
        (typeof FileList !== 'undefined' && value instanceof FileList)
    );
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
        const value = (variables as Literal)[key];

        if (value instanceof Date) {
            // Replace native toJSON() function by our own implementation
            value.toJSON = () => formatIsoDateTime(value);
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
