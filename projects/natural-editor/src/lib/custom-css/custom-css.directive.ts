import {Directive, HostBinding, Inject, Input, OnDestroy} from '@angular/core';
import {DOCUMENT} from '@angular/common';

/**
 * Prefix all CSS selectors with the given selector
 *
 * This is meant to be relatively simple and might not cover advanced CSS syntax
 */
export function prefixCss(prefix: string, css: string): string {
    prefix = '\n' + prefix + ' ';

    return css
        .replace(/([^{}]*){/gs, selectors =>
            selectors
                .split(',')
                .map(selector => {
                    if (selector.trim().startsWith('@media')) {
                        return selector.trim();
                    } else {
                        return prefix + selector.trim();
                    }
                })
                .join(','),
        )
        .trim();
}

let uniqueId = 0;
let componentCount = 0;

/**
 * Inject custom CSS into component and scope the CSS only to this component
 *
 * Usage :
 *
 * ```html
 * <div [naturalCustomCss]=".my-class {background: red}">
 *     <p class="my-class">foo bar</p>
 * </div>
 * ```
 */
@Directive({
    selector: '[naturalCustomCss]',
})
export class NaturalCustomCssDirective implements OnDestroy {
    private style: HTMLStyleElement | null = null;

    @HostBinding('attr.data-natural-id') private readonly id = 'n' + ++uniqueId;

    @Input()
    public set naturalCustomCss(value: string | undefined) {
        if (value && !this.style) {
            this.style = this.document.createElement('style');
            this.document.head.appendChild(this.style);
        }

        if (this.style) {
            this.style.innerHTML = value ? prefixCss(`[data-natural-id=${this.id}]`, value) : '';
        }
    }

    public constructor(@Inject(DOCUMENT) private readonly document: Document) {}

    public ngOnDestroy(): void {
        this.style?.remove();

        // Reset uniqueId if we have no component alive anymore, so that we never reach max int
        componentCount--;
        if (componentCount <= 0) {
            uniqueId = 0;
        }
    }
}
