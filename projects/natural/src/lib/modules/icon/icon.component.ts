import {Component, HostBinding, Inject, InjectionToken, Input} from '@angular/core';
import {MatIconRegistry} from '@angular/material/icon';
import {DomSanitizer} from '@angular/platform-browser';

interface NaturalIconType {
    name: string;
    svg?: string;
    font?: string;
    class?: 'negative' | 'neutral' | 'positive';
}

export interface NaturalIconConfig {
    svg?: string;
    font?: string;
    class?: 'negative' | 'neutral' | 'positive';
}

export interface NaturalIconsConfig {
    [key: string]: NaturalIconConfig;
}

export const IconsConfigService = new InjectionToken<NaturalIconsConfig>('NaturalIconsConfig');

const naturalRegistered: unique symbol = Symbol('Natural icon registered');

@Component({
    selector: 'natural-icon',
    templateUrl: './icon.component.html',
    styleUrls: ['./icon.component.scss'],
})
export class NaturalIconComponent {
    @HostBinding('style.color') public fgColor = 'inherit';
    @HostBinding('class.material-icons') public isMaterialIcon = true;
    @HostBinding('class.mat-icon') public isIcon = true;
    @HostBinding('style.min-width.px') public width = 24;
    @HostBinding('style.min-height.px') public height = 24;
    @HostBinding('style.font-size.px') public fontSize = 24;

    @Input() public label?: string;
    @Input() public labelColor: 'primary' | 'warn' | 'accent' = 'accent';
    @Input() public labelPosition: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' = 'top-right';

    public icon: NaturalIconType = {
        name: '',
    };

    public constructor(
        private readonly matIconRegistry: MatIconRegistry,
        private readonly domSanitizer: DomSanitizer,
        @Inject(IconsConfigService) private readonly config: NaturalIconsConfig,
    ) {
        this.registerIcons(config);
    }

    @Input() public set name(value: string) {
        const newIcon: NaturalIconType = {name: value};
        if (this.config[value]) {
            this.icon = Object.assign(newIcon, this.config[value]);
        } else {
            newIcon.font = value;
            this.icon = newIcon;
        }
    }

    @Input() public set size(val: number) {
        val = val == null ? 24 : val;
        this.height = val;
        this.width = val;
        this.fontSize = val;
    }

    private registerIcons(config: NaturalIconsConfig): void {
        // Ensure that this specific instance of registry has our our icons
        // exactly once, not less and not more
        const registry = this.matIconRegistry as any;
        if (registry[naturalRegistered]) {
            return;
        }
        registry[naturalRegistered] = true;

        for (const key of Object.keys(config)) {
            const svg = config[key].svg;
            if (svg) {
                this.matIconRegistry.addSvgIcon(key, this.domSanitizer.bypassSecurityTrustResourceUrl(svg));
            }
        }
    }
}
