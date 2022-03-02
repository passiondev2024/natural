import {Injectable} from '@angular/core';
import {Source, SourceCreator} from '../sources/source';
import {Gravatar} from '../sources/gravatar';
import {Initials} from '../sources/initials';
import {Image} from '../sources/image';
import {AvatarComponent} from '../component/avatar.component';

/**
 * Provides utilities methods related to Avatar component
 */
@Injectable({
    providedIn: 'root',
})
export class AvatarService {
    /**
     * Ordered pairs of possible sources. First in list is the highest priority.
     * And key must match one the input of AvatarComponent.
     */
    private readonly sourceCreators = new Map<keyof AvatarComponent, SourceCreator>([
        ['gravatar', Gravatar],
        ['image', Image],
        ['initials', Initials],
    ]);

    private readonly avatarColors = [
        '#1abc9c',
        '#3498db',
        '#f1c40f',
        '#8e44ad',
        '#e74c3c',
        '#d35400',
        '#2c3e50',
        '#7f8c8d',
    ];

    private readonly failedSources = new Map<string, Source>();

    public constructor() {}

    public getRandomColor(avatarText: string): string {
        if (!avatarText) {
            return 'transparent';
        }
        const asciiCodeSum = this.calculateAsciiCode(avatarText);

        return this.avatarColors[asciiCodeSum % this.avatarColors.length];
    }

    public getCreators(): IterableIterator<[keyof AvatarComponent, SourceCreator]> {
        return this.sourceCreators.entries();
    }

    private getSourceKey(source: Source): string {
        return source.constructor.name + '-' + source.getValue();
    }

    public sourceHasFailedBefore(source: Source): boolean {
        return this.failedSources.has(this.getSourceKey(source));
    }

    public markSourceAsFailed(source: Source): void {
        this.failedSources.set(this.getSourceKey(source), source);
    }

    private calculateAsciiCode(value: string): number {
        return value
            .split('')
            .map(letter => letter.charCodeAt(0))
            .reduce((previous, current) => previous + current);
    }
}
