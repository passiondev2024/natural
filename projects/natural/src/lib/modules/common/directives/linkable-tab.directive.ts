import {AfterViewInit, Directive, Input} from '@angular/core';
import {MatTab, MatTabChangeEvent, MatTabGroup} from '@angular/material/tabs';
import {ActivatedRoute, Router} from '@angular/router';
import {clone} from 'lodash-es';
import {takeUntil} from 'rxjs/operators';
import {NaturalAbstractController} from '../../../classes/abstract-controller';

/**
 * Returns an identifier for the tab
 */
function getTabId(tab: MatTab): string {
    return tab.content?.viewContainerRef.element.nativeElement.id ?? '';
}

/**
 * Usage :
 *
 * <mat-tab-group [naturalLinkableTab]="!isPanel">
 *     <mat-tab label="Third 1">third 1</mat-tab> // First tab doesn't need id. This keeps url clean on default one
 *     <mat-tab label="Third 2" id="third2">Third 2</mat-tab>
 *     ...
 * </mat-tab-group>
 */
@Directive({
    selector: 'mat-tab-group[naturalLinkableTab]',
})
export class NaturalLinkableTabDirective extends NaturalAbstractController implements AfterViewInit {
    /**
     * If false, disables the persistent navigation
     */
    @Input() public naturalLinkableTab: boolean | '' = true;

    public constructor(
        private readonly component: MatTabGroup,
        private readonly route: ActivatedRoute,
        private readonly router: Router,
    ) {
        super();
    }

    public ngAfterViewInit(): void {
        if (this.naturalLinkableTab === false) {
            return;
        }

        // When url params change, update the mat-tab-group selected tab
        this.route.fragment.pipe(takeUntil(this.ngUnsubscribe)).subscribe(fragment => {
            // Get index of tab that matches wanted name
            const tabIndex = this.getTabIndex(fragment);

            // If tab index is valid (>= 0) go to given fragment
            // If there is no fragment at all, go to first tab (index is -1 in this case)
            if (tabIndex >= 0 || !fragment) {
                this.component.selectedIndex = tabIndex;
            }
        });

        // When mat-tab-groups selected tab change, update url
        this.component.selectedTabChange.pipe(takeUntil(this.ngUnsubscribe)).subscribe((event: MatTabChangeEvent) => {
            const activatedTabName = getTabId(event.tab);
            const segments = this.route.snapshot.url;
            if (!segments.length) {
                // This should never happen in normal usage, because it would means there is no route at all in the app
                throw new Error('Cannot update URL for tabs without any segments in URL');
            }

            // Get url matrix params (/segment;matrix=param) only without route params (segment/:id)
            const params = clone(segments[segments.length - 1].parameters);

            this.router.navigate(['.', params], {
                relativeTo: this.route,
                queryParamsHandling: 'preserve',
                fragment: activatedTabName && activatedTabName.length ? activatedTabName : undefined,
            });
        });
    }

    private getTabIndex(fragment: string | null): number {
        return this.component._tabs.toArray().findIndex(tab => fragment === getTabId(tab));
    }
}
