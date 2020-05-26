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

@Component({
    selector: 'natural-icon',
    templateUrl: './icon.component.html',
    styleUrls: ['./icon.component.scss'],
})
export class NaturalIconComponent {
    private static registered = false;

    /**
     * Mapping table of internal icon aliases
     */
    private static mapping: NaturalIconsConfig = {};

    @HostBinding('style.color') fgColor = 'inherit';
    @HostBinding('class.material-icons') isMaterialIcon = true;
    @HostBinding('class.mat-icon') isIcon = true;
    @HostBinding('style.min-width.px') width = 24;
    @HostBinding('style.min-height.px') height = 24;
    @HostBinding('style.font-size.px') fontSize = 24;

    @Input() label;
    @Input() labelColor: 'primary' | 'warn' | 'accent' = 'accent';
    @Input() labelPosition: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' = 'top-right';

    public icon: NaturalIconType;

    constructor(
        public matIconRegistry: MatIconRegistry,
        private domSanitizer: DomSanitizer,
        @Inject(IconsConfigService) private config,
    ) {
        this.registerIcons(config);
    }

    @Input() set name(value: string) {
        const newIcon: NaturalIconType = {name: value};
        if (NaturalIconComponent.mapping[value]) {
            this.icon = Object.assign(newIcon, NaturalIconComponent.mapping[value]);
        } else {
            newIcon.font = value;
            this.icon = newIcon;
        }
    }

    @Input() set size(val: number) {
        val = val == null ? 24 : val;
        this.height = val;
        this.width = val;
        this.fontSize = val;
    }

    private registerIcons(config) {
        if (NaturalIconComponent.registered) {
            return;
        }

        NaturalIconComponent.mapping = config;

        for (const key in config) {
            if (config[key].svg) {
                this.matIconRegistry.addSvgIcon(key, this.domSanitizer.bypassSecurityTrustResourceUrl(config[key].svg));
            }
        }

        NaturalIconComponent.registered = true;
    }
}
