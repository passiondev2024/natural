import {Source} from './source';

/**
 * Get the initials of each word in uppercase.
 */
function getInitials(name: string, size: number): string {
    // Drop all text in parentheses, because assumed less important
    name = name.replace(/\([^)]*\)/g, '');
    name = name.trim();

    // Deliberately short name is kept intact
    if (name.length <= size) {
        return name.toUpperCase();
    }

    // Only letters (including unicode), numbers, and whitespace
    name = name.replace(/[^\p{L}\p{N}\s]/gu, '');

    if (!name) {
        return '';
    }

    let words = name.split(/\s+/);
    if (size && size < words.length) {
        words = words.slice(0, size);
    }

    return words
        .filter(element => element.length > 0)
        .map(element => element[0])
        .join('')
        .toUpperCase();
}

/**
 * Return the initials of the given value as avatar
 */
export class Initials extends Source {
    public getAvatar(size: number): string {
        return getInitials(this.getValue(), size);
    }

    public isTextual(): boolean {
        return true;
    }
}
