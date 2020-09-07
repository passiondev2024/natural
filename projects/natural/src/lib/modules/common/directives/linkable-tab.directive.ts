import {AfterViewInit, Directive, Input, OnInit} from '@angular/core';
import {MatTab, MatTabChangeEvent, MatTabGroup} from '@angular/material/tabs';
import {ActivatedRoute} from '@angular/router';
import {NaturalAbstractController} from '../../../classes/abstract-controller';
import {skip, takeUntil} from 'rxjs/operators';
import {NaturalPersistenceService} from '../../../services/persistence.service';

/**
 * Does nothing but needs to be declared to be valid attribute
 */
@Directive({
    selector: 'mat-tab[naturalLinkableTabName]',
})
export class NaturalLinkableTabNameDirective {
    @Input() public naturalLinkableTabName?: string;
}

/**
 * This directive only supports ReactiveForms due to ngModel/ngControl encapsulation and changes emissions.
 *
 * Usage :
 *
 * <mat-tab-group [naturalLinkableTab]="isPanel ? false : 'myTabGroup'">
 *     <mat-tab label="Third 1">third 1</mat-tab> // First tab doesn't need naturalLinkableTabName. This keeps url clean on default one
 *     <mat-tab label="Third 2" naturalLinkableTabName="third2">Third 2</mat-tab>
 *     ...
 * </mat-tab-group>
 */
@Directive({
    selector: 'mat-tab-group[naturalLinkableTab]',
})
export class NaturalLinkableTabDirective extends NaturalAbstractController implements OnInit, AfterViewInit {
    /**
     * Default name applied to tab groups
     */
    public static defaultName = 'tab';

    /**
     * Key for url params where all tag-groups are persisted
     */
    public static navigationKeyName = 'tabs';

    /**
     * If false, disables the persistent navigation
     * If string (default 'tab') is provided, it's used as key in url for that mat-tab-group
     */
    @Input() public naturalLinkableTab!: string | false;

    constructor(
        private component: MatTabGroup,
        private persistenceService: NaturalPersistenceService,
        private route: ActivatedRoute,
    ) {
        super();
    }

    /**
     * Returns the value from naturalLinkableTabName directive
     */
    private static getTabName(tab: MatTab): string {
        return tab.content?.viewContainerRef.element.nativeElement.getAttribute('naturallinkabletabname');
    }

    public ngOnInit(): void {
        if (this.naturalLinkableTab === '') {
            this.naturalLinkableTab = NaturalLinkableTabDirective.defaultName;
        }
    }

    public ngAfterViewInit(): void {
        if (this.naturalLinkableTab === false) {
            return;
        }

        const groupKey: string = this.naturalLinkableTab as string;
        const allGroupsKey = NaturalLinkableTabDirective.navigationKeyName;

        // When url params change, update the mat-tab-group selected tab
        this.route.params.subscribe(() => {
            const tabsFromUrl = this.persistenceService.getFromUrl(allGroupsKey, this.route) || {};
            const tabName = tabsFromUrl?.[groupKey] || null; // null is for first tab

            // Get index of tab that matches wanted name
            const tabIndex = this.component._tabs
                .toArray()
                .findIndex(tab => tabName === NaturalLinkableTabDirective.getTabName(tab));

            // If found, apply to mat-tab-group
            if (tabIndex) {
                this.component.selectedIndex = +tabIndex;
            }
        });

        // When mat-tab-groups selected tab change, update url
        // Skip() prevents initial navigation (get from url and apply) to be followed by an useless navigation that can close all panels
        const hasParams = this.route.snapshot.params[allGroupsKey] ? 1 : 0;
        this.component.selectedTabChange
            .pipe(takeUntil(this.ngUnsubscribe), skip(hasParams))
            .subscribe((event: MatTabChangeEvent) => {
                const activatedTabName = NaturalLinkableTabDirective.getTabName(event.tab);

                // Get url params as they are at that specific moment
                const params = this.persistenceService.getFromUrl(allGroupsKey, this.route) || {};

                // Update params
                if (activatedTabName) {
                    params[groupKey] = activatedTabName;
                } else {
                    delete params[groupKey];
                }

                // Update url with new values
                const valueForUrl = Object.keys(params).length > 0 ? params : null; // null clears url
                this.persistenceService.persistInUrl('tabs', valueForUrl, this.route);
            });
    }
}
