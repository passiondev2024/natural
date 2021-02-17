/**
 * A creator interface used to instantiate source implementation
 */
export type SourceCreator = new (sourceValue: string) => Source;

/**
 * Contract of all Sources.
 * Every source must implements the fetch method
 * in order to provide the avatar source.
 */
export abstract class Source {
    constructor(private value: string) {
        this.value = value;
    }

    public getValue(): string {
        return this.value;
    }

    /**
     * Gets the avatar that usually is a URL, but,
     * for example it can also be a string of initials from the name.
     */
    public abstract getAvatar(size: number): string;

    /**
     * Whether the avatar is purely textual or an URL for an image
     */
    public abstract isTextual(): boolean;
}
