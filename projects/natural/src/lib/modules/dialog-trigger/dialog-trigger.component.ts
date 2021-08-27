import {ComponentType} from '@angular/cdk/portal';
import {Component, OnDestroy} from '@angular/core';
import {MatDialog, MatDialogConfig, MatDialogRef} from '@angular/material/dialog';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';

export interface NaturalDialogTriggerRoutingData<T, D> {
    component: ComponentType<T>;
    afterClosedRoute?: RouterLink['routerLink'];
    dialogConfig: MatDialogConfig<D>;
}

export type NaturalDialogTriggerProvidedData<D> = {
    data?: Readonly<D> | null;
    activatedRoute: ActivatedRoute;
};

export type NaturalDialogTriggerRedirectionValues = RouterLink['routerLink'] | null | undefined | '' | -1;

@Component({
    template: '',
})
export class NaturalDialogTriggerComponent<T, D> implements OnDestroy {
    private readonly dialogRef: MatDialogRef<T, NaturalDialogTriggerRedirectionValues>;

    private readonly triggerConfig: NaturalDialogTriggerRoutingData<T, D>;

    constructor(
        private readonly dialog: MatDialog,
        private readonly route: ActivatedRoute,
        private readonly router: Router,
    ) {
        // Data from activated route
        this.triggerConfig = this.route.snapshot.data.trigger as NaturalDialogTriggerRoutingData<T, D>;

        // Get data relative to dialog service configuration
        const {data, ...config} = this.triggerConfig.dialogConfig;
        const dialogConfig: MatDialogConfig<NaturalDialogTriggerProvidedData<D>> = {
            ...config,
            data: {
                data: data,
                // Set data accessible into component instantiated by the dialog service
                activatedRoute: this.route,
            },
        };

        this.dialogRef = this.dialog.open<
            T,
            NaturalDialogTriggerProvidedData<D>,
            NaturalDialogTriggerRedirectionValues
        >(this.triggerConfig.component, dialogConfig);

        // Redirect on closing (if applicable)
        this.dialogRef.beforeClosed().subscribe(exitValue => this.redirect(exitValue));
    }

    /**
     * Called when router leaves route, and so on, closes the modal with undefined value to prevent a new redirection
     */
    public ngOnDestroy(): void {
        if (this.dialogRef) {
            this.dialogRef.close(-1); // -1 = no redirection
        }
    }

    /**
     * Redirects on modal closing under following rules/conditions
     *
     * If -1 : no redirection
     * If undefined, null or empty string : uses the router provided redirection route or fallbacks on parent route if router don't provide
     * If a value is provided, should be of type any[] and it's used for redirection.
     */
    public redirect(exitValue: NaturalDialogTriggerRedirectionValues): void {
        const isEmptyExitValue = exitValue == null || exitValue === ''; // undefined, null or ''

        if (exitValue === -1) {
            // if -1, don't redirect
            return;
        } else if (!isEmptyExitValue) {
            // If value provided, redirect to that route
            this.router.navigate(exitValue as any[]);
        } else if (isEmptyExitValue && this.triggerConfig.afterClosedRoute) {
            // If value is not provided (null) and router context specified default redirection route, use it
            this.router.navigate(this.triggerConfig.afterClosedRoute as any[]);
        } else if (isEmptyExitValue) {
            // If neither of component or router provides redirection, go to parent (care : parent can't have empty path : ''),
            this.router.navigate(['.'], {relativeTo: this.route.parent});
        }
    }
}
