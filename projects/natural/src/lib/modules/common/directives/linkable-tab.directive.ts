import {AfterViewInit, Directive, Input, OnInit} from '@angular/core';
import {MatTab, MatTabChangeEvent, MatTabGroup} from '@angular/material/tabs';
import {ActivatedRoute, Router} from '@angular/router';
import {clone} from 'lodash-es';
import {skip, takeUntil} from 'rxjs/operators';
import {NaturalAbstractController} from '../../../classes/abstract-controller';

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
     * If false, disables the persistent navigation
     * If string (default 'tab') is provided, it's used as key in url for that mat-tab-group
     */
    @Input() public naturalLinkableTab!: string | false;

    constructor(private component: MatTabGroup, private route: ActivatedRoute, private router: Router) {
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
            this.naturalLinkableTab = 'tab';
        }
    }

    public ngAfterViewInit(): void {
        if (this.naturalLinkableTab === false) {
            return;
        }

        const groupKey: string = this.naturalLinkableTab as string;

        // When url params change, update the mat-tab-group selected tab
        this.route.params.subscribe(() => {
            const tabName = this.route.snapshot.params[groupKey] || null;

            // Get index of tab that matches wanted name
            const tabIndex = this.component._tabs
                .toArray()
                .findIndex(tab => tabName === NaturalLinkableTabDirective.getTabName(tab));

            this.component.selectedIndex = +tabIndex;
        });

        // When mat-tab-groups selected tab change, update url
        // Skip() prevents initial navigation (get from url and apply) to be followed by an useless navigation that can close all panels
        const hasParams = this.route.snapshot.params[groupKey] ? 1 : 0;
        this.component.selectedTabChange
            .pipe(takeUntil(this.ngUnsubscribe), skip(hasParams))
            .subscribe((event: MatTabChangeEvent) => {
                const activatedTabName = NaturalLinkableTabDirective.getTabName(event.tab);

                // Get url params as they are at that specific moment
                const params = clone(this.route.snapshot.params);

                // Update params
                if (activatedTabName) {
                    params[groupKey] = activatedTabName;
                } else {
                    delete params[groupKey];
                }

                this.router.navigate(['.', params], {preserveFragment: true, queryParamsHandling: 'preserve'});
            });
    }
}
