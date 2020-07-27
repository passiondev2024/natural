import {ComponentType} from '@angular/cdk/portal';
import {Component, OnDestroy} from '@angular/core';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {MatDialogRef} from '@angular/material/dialog/dialog-ref';

export interface NaturalDialogTriggerRoutingData {
    component: ComponentType<any>;
    afterClosedRoute: RouterLink['routerLink'];
    dialogConfig: MatDialogConfig;

    [key: string]: any;
}

export interface NaturalDialogTriggerProvidedData {
    activatedRoute: ActivatedRoute;
}

export type NaturalDialogTriggerRedirectionValues = RouterLink['routerLink'] | null | undefined | '' | -1;

@Component({
    template: '',
})
export class NaturalDialogTriggerComponent implements OnDestroy {
    private dialogRef: MatDialogRef<unknown, NaturalDialogTriggerRedirectionValues>;

    constructor(private dialog: MatDialog, private route: ActivatedRoute, private router: Router) {
        // Data from activated route
        const routeData = this.route.snapshot.data as NaturalDialogTriggerRoutingData;

        // Get data relative to dialog service configuration
        const config: MatDialogConfig<NaturalDialogTriggerProvidedData> = routeData.dialogConfig;

        // Set data accessible into component instantiated by the dialog service
        config.data = Object.assign(config.data, {activatedRoute: this.route});

        this.dialogRef = this.dialog.open(this.route.snapshot.data.component, config);

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
        } else if (isEmptyExitValue && this.route.snapshot.data.afterClosedRoute) {
            // If value is not provided (null) and router context specified default redirection route, use it
            this.router.navigate(this.route.snapshot.data.afterClosedRoute as any[]);
        } else if (isEmptyExitValue) {
            // If neither of component or router provides redirection, go to parent (care : parent can't have empty path : ''),
            this.router.navigate(['.'], {relativeTo: this.route.parent});
        }
    }
}
