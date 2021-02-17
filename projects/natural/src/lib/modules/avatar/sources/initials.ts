import {Source} from './source';

/**
 * Iterates a person's name string to get the initials of each word in uppercase.
 */
function getInitials(name: string, size: number): string {
    name = name.trim();

    if (!name) {
        return '';
    }

    let words: string[] = name.split(' ');

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
