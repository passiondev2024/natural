import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';

import {Source} from '../sources/source';
import {AvatarService} from '../service/avatar.service';
import {NgStyle, NgIf} from '@angular/common';

type Style = Partial<CSSStyleDeclaration>;

/**
 * Show an avatar from different sources
 */
@Component({
    selector: 'natural-avatar',
    styles: [
        `
            :host {
                border-radius: 50%;
            }
        `,
    ],
    template: `
        <div class="avatar-container" [ngStyle]="hostStyle">
            <img
                *ngIf="avatarSrc"
                [src]="avatarSrc"
                [width]="size"
                [height]="size"
                [ngStyle]="avatarStyle"
                (error)="tryNextSource()"
                class="avatar-content"
                loading="lazy"
            />
            <div *ngIf="avatarText" class="avatar-content" [ngStyle]="avatarStyle">
                {{ avatarText }}
            </div>
        </div>
    `,
    standalone: true,
    imports: [NgStyle, NgIf],
})
export class NaturalAvatarComponent implements OnChanges {
    @Input() public image?: string | null;
    @Input() public initials?: string | null;
    @Input() public gravatar?: string | null;

    @Input() public size = 50;
    @Input() public textSizeRatio = 3;
    @Input() public bgColor: string | undefined;
    @Input() public fgColor = '#FFF';
    @Input() public borderRadius = '';
    @Input() public textMaximumLength = 0;

    public avatarSrc: string | null = null;
    public avatarText: string | null = null;
    public avatarStyle: Style = {};
    public hostStyle: Style = {};

    private currentIndex = -1;
    private sources: Source[] = [];

    public constructor(private readonly avatarService: AvatarService) {}

    /**
     * Detect inputs change
     */
    public ngOnChanges(changes: SimpleChanges): void {
        this.sources.length = 0;
        for (const [propName, creator] of this.avatarService.getCreators()) {
            if (!changes[propName]) {
                continue;
            }

            const currentValue = changes[propName].currentValue;
            if (currentValue && typeof currentValue === 'string') {
                this.sources.push(new creator(currentValue));
            }
        }

        // reinitialize the avatar component when a source property value has changed
        // the fallback system must be re-invoked with the new values.
        this.initializeAvatar();
    }

    /**
     * Fetch avatar source
     */
    public tryNextSource(): void {
        const previousSource = this.sources[this.currentIndex];
        if (previousSource) {
            this.avatarService.markSourceAsFailed(previousSource);
        }

        const source = this.findNextSource();
        if (!source) {
            this.clearAvatar();
            return;
        }

        if (source.isTextual()) {
            this.buildTextAvatar(source);
        } else {
            this.buildImageAvatar(source);
        }
    }

    private findNextSource(): Source | null {
        while (++this.currentIndex < this.sources.length) {
            const source = this.sources[this.currentIndex];
            if (source && !this.avatarService.sourceHasFailedBefore(source)) {
                return source;
            }
        }

        return null;
    }

    /**
     * Initialize the avatar component and its fallback system
     */
    private initializeAvatar(): void {
        this.currentIndex = -1;
        if (this.sources.length > 0) {
            this.tryNextSource();
            this.hostStyle = {
                width: this.size + 'px',
                height: this.size + 'px',
            };
        }
    }

    private clearAvatar(): void {
        this.avatarSrc = null;
        this.avatarText = null;
        this.avatarStyle = {};
    }

    private buildTextAvatar(avatarSource: Source): void {
        this.clearAvatar();
        this.avatarText = avatarSource.getAvatar(+this.textMaximumLength);
        this.avatarStyle = this.getTextualStyle(avatarSource.getValue());
    }

    private buildImageAvatar(avatarSource: Source): void {
        this.clearAvatar();
        this.avatarSrc = avatarSource.getAvatar(+this.size);
        this.avatarStyle = this.getImageStyle();
    }

    /**
     * Returns initials style
     */
    private getTextualStyle(avatarValue: string): Style {
        return {
            textAlign: 'center',
            borderRadius: this.borderRadius || '100%',
            textTransform: 'uppercase',
            color: this.fgColor,
            backgroundColor: this.bgColor ? this.bgColor : this.avatarService.getRandomColor(avatarValue),
            font: Math.floor(+this.size / this.textSizeRatio) + 'px Helvetica, Arial, sans-serif',
            lineHeight: this.size + 'px',
        };
    }

    /**
     * Returns image style
     */
    private getImageStyle(): Style {
        return {
            maxWidth: '100%',
            borderRadius: this.borderRadius || '100%',
            width: this.size + 'px',
            height: this.size + 'px',
        };
    }
}
