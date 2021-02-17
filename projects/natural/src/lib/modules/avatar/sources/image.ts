import {Source} from './source';

/**
 * Return custom image URL as avatar
 */
export class Image extends Source {
    public getAvatar(): string {
        return this.getValue();
    }

    public isTextual(): boolean {
        return false;
    }
}
