import { ComponentType } from '@angular/cdk/portal';
import { Inject, Injectable, Injector } from '@angular/core';
import { MediaChange, MediaObserver } from '@angular/flex-layout';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute, DefaultUrlSerializer, NavigationError, Router, UrlSegment } from '@angular/router';
import { NaturalPanelsUrlMatcherUtility } from './panels.urlmatcher';
import { differenceWith, flatten, isEqual } from 'lodash';
import { forkJoin, Observable, of, Subject, Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { NaturalAbstractPanel } from './abstract-panel';
import { NaturalPanelConfig, NaturalPanelData, NaturalPanelsBeforeOpenPanel, PanelsHooksConfig } from './types';

/**
 * TODO: implement route update when closing dialog with escape
 * @dynamic
 */
@Injectable({
    providedIn: 'root',
})
export class NaturalPanelsService {

    /**
     * Cache for panels counter. Works more like an ID.
     * Is used to give an unique identifier to multiple similar panels configurations
     */
    private counter = 1;

    /**
     * Stream that emits when all open dialog have finished closing
     */
    public afterAllClosed = new Subject();

    /**
     * Class applied to dialog overlay related with panels
     * If change, change CSS too
     */
    private panelClass = 'panel';

    /**
     * Cache for panels setup before navigation change.
     * Used to detect panels openings/closings and adapt for new configuration
     */
    private oldFullConfig: NaturalPanelConfig[] = [];

    /**
     * Cache for subscription stop
     */
    private routeSub: Subscription;

    /**
     * Cache for subscription stop
     */
    private navSub: Subscription;

    /**
     * Horizontal gaps between panels
     */
    private panelsOffsetH = 35;

    /**
     * Vertical gaps between panels
     */
    private panelsOffsetV = 40;

    /**
     * Cache of previous screen size
     * Used to change panels stack orientation on small screens
     */
    private media: string | null = null;

    constructor(private router: Router,
                private dialog: MatDialog,
                private injector: Injector,
                @Inject(PanelsHooksConfig) private hooksConfig,
                private mediaService: MediaObserver) {

        // Watch media to know if display panels horizontally or vertically
        this.mediaService.asObservable().subscribe((medias: MediaChange[]) => {
            for (const media of medias) {
                if (!this.media) {
                    this.media = media.mqAlias;
                } else if (this.media !== media.mqAlias) {
                    this.media = media.mqAlias;
                    this.updateComponentsPosition();
                }
            }
        });
    }

    public static segmentsToString(segments: UrlSegment[]) {
        return segments.map(s => s.toString()).join('/');
    }

    public start(route: ActivatedRoute) {

        this.routeSub = route.url.subscribe((segments: UrlSegment[]) => {
            this.updatePanels(segments);
        });

        this.navSub = this.router.events.pipe(filter(ev => ev instanceof NavigationError)).subscribe((ev: any) => {
            this.counter++;

            // pc stands for "panel counter", required to give an identification to panels with exact same config
            // E.g /new
            const wantedUrl = ev.url + ';pc=' + this.counter;

            // Segments matching from wanted url. E.g ~ ['new']
            const wantedUrSegments = new DefaultUrlSerializer().parse(wantedUrl).root.children.primary.segments;

            // Don't match any config
            const wantedConfig = NaturalPanelsUrlMatcherUtility.getStackConfig(wantedUrSegments, this.injector);

            if (wantedConfig.length) {
                return this.appendConfigToCurrentUrl(wantedConfig);
            }

            // Currently activated routes. E.g ['objective', 'objective', 123, 'risk']
            const currentSegments = flatten(this.dialog.openDialogs.map(d => d.componentInstance.panelData.config.route.segments));

            // Last segment. E.g ['risk']
            const lastOfCurrentSegments = currentSegments.slice(-1);

            // Config for ['risk', 'new']
            const currentAndWantedConfig = NaturalPanelsUrlMatcherUtility.getStackConfig(lastOfCurrentSegments.concat(wantedUrSegments),
                this.injector);

            return this.appendConfigToCurrentUrl(currentAndWantedConfig);
        });

    }

    /**
     * Uses given configuration to add in the end of current url
     * Neutralizes router error handling
     */
    public appendConfigToCurrentUrl(config) {

        const originalErrorHandler = this.router.errorHandler;

        // Nullify error handler (will be de-neutralized after route redirection)
        if (config) {
            this.router.errorHandler = (() => {
            });
        }

        // Navigate to same url + /risk/new Result : /risk/risk/new
        const newUrl = config.map(conf => NaturalPanelsService.segmentsToString(conf.route.segments)).join('/');

        this.router.navigateByUrl(this.router.url + '/' + newUrl).then(() => {
            // After navigation has ended, restore original error handler because he's not a bad guy
            this.router.errorHandler = originalErrorHandler;
        });

    }

    public stop() {
        this.routeSub.unsubscribe();
        this.navSub.unsubscribe();
        this.dialog.closeAll();
        this.oldFullConfig = [];
        this.afterAllClosed.next();
    }

    /**
     * Go to panel matching given component. Causes an url change.
     */
    public goToPanelByComponent(component) {
        this.goToPanelByIndex(this.getPanelIndex(component));
    }

    /**
     * Go to panel matching given component. Causes an url change.
     */
    public goToPenultimatePanel() {
        this.goToPanelByIndex(this.dialog.openDialogs.length - 2);
    }

    /**
     * Calls the new url that only includes the segments from the panels we want to stay open
     */
    public goToPanelByIndex(index) {

        // Extracts url segments from next panel until last one
        const url = this.dialog.openDialogs.slice(index + 1).map(dialog => {
            return NaturalPanelsService.segmentsToString(dialog.componentInstance.panelData.config.route.segments);
        }).join('/');

        // Remove extra segments and redirects to root
        this.router.navigateByUrl(this.router.url.replace('/' + url, ''));
    }

    /**
     * Selecting a panel is equivalent to close all those that are in front of him
     * @param index of panel in stack. The most behind (the first one) is 0.
     */
    public selectPanelByIndex(index: number) {

        const lastDialog = this.dialog.openDialogs[this.dialog.openDialogs.length - 1];

        // Update new panels set positions
        this.updateComponentsPosition();

        for (let i = this.dialog.openDialogs.length - 1; i >= index + 1; i--) {
            this.dialog.openDialogs[i].close();
        }

        return lastDialog.afterClosed();
    }

    private compareConfigs(a, b) {
        return a.route.path === b.route.path && a.route.rule === b.route.rule && isEqual(a.params, b.params);
    }

    /**
     * Open new panels if url has changed with new segments
     */
    private updatePanels(segments: UrlSegment[]) {

        // Transform url segments into a config with component name and ID if provided in next segment
        // Returns an array of configs, each config represents the content relative to a panel
        const newFullConfig = NaturalPanelsUrlMatcherUtility.getStackConfig(segments, this.injector);
        const configsToRemove = differenceWith(this.oldFullConfig, newFullConfig, this.compareConfigs);
        const configsToAdd = differenceWith(newFullConfig, this.oldFullConfig, this.compareConfigs);

        const indexOfNextPanel = this.oldFullConfig.length - configsToRemove.length - 1;

        if (configsToRemove.length && configsToAdd.length) {
            // Add and remove panels
            this.selectPanelByIndex(indexOfNextPanel).subscribe(() => {
                this.openPanels(configsToAdd, newFullConfig).subscribe(() => this.updateComponentsPosition());
            });

        } else if (configsToRemove.length && !configsToAdd.length) {

            // only remove panels
            this.selectPanelByIndex(indexOfNextPanel).subscribe(() => this.updateComponentsPosition());

        } else if (!configsToRemove.length && configsToAdd.length) {

            // only add panels
            this.openPanels(configsToAdd, newFullConfig).subscribe(() => this.updateComponentsPosition());
        }

        this.oldFullConfig = newFullConfig;
    }

    /**
     * Resolve all services, then open panels
     */
    private openPanels(newItemsConfig: NaturalPanelConfig[], fullConfig: NaturalPanelConfig[]): Observable<Observable<any> | null> {

        const subject = new Subject<Observable<any> | null>();

        // Resolve everything before opening a single panel
        const resolves = newItemsConfig.map((conf: NaturalPanelConfig) => this.getResolvedData(conf));

        // ForkJoin emits when all promises are executed;
        forkJoin(resolves).subscribe((resolvedResult: any) => {

            // For each new config entry, open a new panel
            for (let i = 0; i < newItemsConfig.length; i++) {
                const config = newItemsConfig[i];
                let itemData: NaturalPanelData = {

                    // Config of actual panel route
                    config: config,

                    // Data resolved by service
                    // Use in component by calling this.panelData.data.xyz
                    data: resolvedResult[i],
                };

                if (this.hooksConfig && this.hooksConfig.beforeOpenPanel) {
                    const context: NaturalPanelsBeforeOpenPanel = {
                        itemData: itemData,
                        panelConfig: config,
                        resolvedResult: resolvedResult,
                        fullPanelsConfig: fullConfig,
                    };

                    itemData = this.hooksConfig.beforeOpenPanel(this.injector, context);
                }

                this.openPanel(config.component, itemData);
            }

            this.dialog.openDialogs[this.dialog.openDialogs.length - 1].afterOpened().subscribe(() => {
                subject.next(null);
            });
        });

        return subject.asObservable();
    }

    private getResolvedData(config: NaturalPanelConfig): Observable<any> {

        if (!config.resolve || config.resolve && Object.keys(config.resolve).length === 0) {
            return of(null);
        }

        const resolveKeys = Object.keys(config.resolve);
        resolveKeys.forEach(key => {
            config.resolve[key] = config.resolve[key].resolve(config);
        });

        return forkJoin(Object.values(config.resolve)).pipe(map((values) => {
            const result: any = {};
            resolveKeys.forEach((key, index) => {
                result[key] = values[index];
            });
            return result.model || result;
        }));

    }

    private openPanel<T>(componentOrTemplateRef: ComponentType<any>, data?: any): any {

        const conf: MatDialogConfig = {
            panelClass: this.panelClass,
            closeOnNavigation: false,
            hasBackdrop: this.dialog.openDialogs.length === 0,
            height: '100%',
            width: '960px',
            position: {
                top: '0',
                right: '0',
            },
        };

        const dialogRef = this.dialog.open<NaturalAbstractPanel>(componentOrTemplateRef, conf);

        // Panelisable interface attributes/functions
        dialogRef.componentInstance.initPanel(data);

        dialogRef.beforeClosed().subscribe(() => {
            const index = this.getPanelIndex(dialogRef.componentInstance);
            this.goToPanelByIndex(index - 1);
        });
    }

    /**
     * Return panel position (index) by searching matching component
     */
    private getPanelIndex(component): number {

        if (!component) {
            return -1;
        }

        return this.dialog.openDialogs.findIndex(dialog => {
            return dialog.componentInstance === component;
        });
    }

    /**
     * Repositions panels from start until given index
     */
    private updateComponentsPosition() {

        if (!this.dialog.openDialogs.length) {
            return;
        }

        // Select the panels that are still opened, ignore the others because they'll be closed
        const affectedElements = this.dialog.openDialogs;

        for (let i = 0; i < affectedElements.length; i++) {
            const dialog = affectedElements[i];

            // Set all panels as "hidden" except last one. IsFrontPanel attribute causes a CSS that hides body via hostbinding
            dialog.componentInstance.isFrontPanel = i === affectedElements.length - 1;
            dialog.componentInstance.panelService = this;

            // Assign offset
            const deep = affectedElements.length - 1 - i;

            let position: any = {right: (deep * this.panelsOffsetH) + 'px'};
            if (this.media === 'xs' && affectedElements.length > 1) {
                position = {
                    top: (i * this.panelsOffsetV) + 'px',
                    right: '0px',
                };
            }

            dialog.updatePosition(position);
        }

    }

}
