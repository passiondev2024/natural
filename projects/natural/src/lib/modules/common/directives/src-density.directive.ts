import {Directive, ElementRef, Input} from '@angular/core';

@Directive({
    selector: 'img[naturalSrcDensity]',
})
export class NaturalSrcDensityDirective {
    /**
     * Automatically apply image selection based on screen density.
     *
     * The given URL **MUST** be the normal density URL. And it **MUST** include
     * the size as last path segment. That size will automatically be changed
     * for other screen densities. That means that the server **MUST** be able to
     * serve an image of the given size.
     *
     * Usage:
     *
     * ```html
     * <img [naturalSrcDensity]="'/api/image/123/200'" />
     * ```
     *
     * Will generate something like:
     *
     * ```html
     * <img
     *     src="/api/image/123/200"
     *     srcset="/api/image/123/200, /api/image/123/300 1.5x, /api/image/123/400 2x, /api/image/123/600 3x, /api/image/123/800 4x"
     * />
     * ```
     *
     * @see https://web.dev/codelab-density-descriptors/
     */
    @Input()
    public set naturalSrcDensity(src: string) {
        if (!src) {
            return;
        }

        const match = src.match(/^(.*\/)(\d+)$/);
        const base = match?.[1];
        const size = +(match?.[2] ?? 0);

        let srcset = '';
        if (base && size) {
            // This should cover most common densities according to https://www.mydevice.io/#tab1
            const size15 = Math.round(size * 1.5);
            const size2 = size * 2;
            const size3 = size * 3;
            const size4 = size * 4;

            srcset = `${base}${size}, ${base}${size15} 1.5x, ${base}${size2} 2x, ${base}${size3} 3x, ${base}${size4} 4x`;
        }

        this.elementRef.nativeElement.src = src;
        this.elementRef.nativeElement.srcset = srcset;
    }

    constructor(private elementRef: ElementRef<HTMLImageElement>) {}
}
