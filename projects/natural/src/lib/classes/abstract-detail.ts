// tslint:disable:directive-class-suffix
import {Directive, Injector, OnInit} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {kebabCase, merge, mergeWith, omit} from 'lodash-es';
import {NaturalAlertService} from '../modules/alert/alert.service';
import {NaturalAbstractPanel} from '../modules/panels/abstract-panel';
import {NaturalAbstractModelService} from '../services/abstract-model.service';
import {ExtractTcreate, ExtractTone, ExtractTupdate, Literal} from '../types/types';
import {finalize} from 'rxjs/operators';
import {ifValid, validateAllFormControls} from './validators';
import {mergeOverrideArray} from './utility';
import {PaginatedData} from './data-source';
import {QueryVariables} from './query-variable-manager';
import {EMPTY, Observable} from 'rxjs';

// @dynamic
@Directive()
export class NaturalAbstractDetail<
        TService extends NaturalAbstractModelService<
            unknown,
            any,
            PaginatedData<Literal>,
            QueryVariables,
            any,
            any,
            any,
            any,
            unknown,
            any
        >,
    >
    extends NaturalAbstractPanel
    implements OnInit
{
    /**
     * Empty placeholder for data retrieved by the server
     */
    public data: any = {
        model: {},
    };

    /**
     * Form that manages the data from the controller
     */
    public form: FormGroup = new FormGroup({});

    /**
     * Show / hides the bottom fab button (mostly to hide it when we are on other tabs where semantic of button can conflict with ...
     * semantic of data on other tab, like relations that list other objects)
     */
    public showFabButton = true;

    /**
     * Injected service
     */
    protected alertService: NaturalAlertService;

    /**
     * Injected service
     */
    protected router: Router;

    /**
     * Injected service
     */
    protected route: ActivatedRoute;

    constructor(
        protected readonly key: string,
        public readonly service: TService,
        protected readonly injector: Injector,
    ) {
        super();

        this.alertService = injector.get(NaturalAlertService);
        this.router = injector.get(Router);
        this.route = injector.get(ActivatedRoute);
    }

    public ngOnInit(): void {
        if (!this.isPanel) {
            this.route.data.subscribe(data => {
                this.data = merge({model: this.service.getConsolidatedForClient()}, data[this.key]);
                this.data = merge(this.data, omit(data, [this.key]));
                this.initForm();
            });
        } else {
            this.initForm();
        }
    }

    public changeTab(index: number): void {
        this.showFabButton = index === 0;
    }

    public update(now: boolean = false): void {
        if (!this.data.model.id) {
            return;
        }

        validateAllFormControls(this.form);

        ifValid(this.form).subscribe(() => {
            this.formToData();
            const postUpdate = (model: ExtractTupdate<TService>) => {
                this.alertService.info($localize`Mis à jour`);
                this.form.patchValue(model);
                this.postUpdate(model);
            };

            if (now) {
                this.service.updateNow(this.data.model).subscribe(postUpdate);
            } else {
                this.service.update(this.data.model).subscribe(postUpdate);
            }
        });
    }

    public create(redirect: boolean = true): void {
        validateAllFormControls(this.form);

        if (!this.form.valid) {
            return;
        }

        this.formToData();
        this.form.disable();

        this.service
            .create(this.data.model)
            .pipe(finalize(() => this.form.enable()))
            .subscribe(model => {
                this.alertService.info($localize`Créé`);
                this.form.patchValue(model);

                this.postCreate(model).subscribe({
                    complete: () => {
                        if (redirect) {
                            if (this.isPanel) {
                                const oldUrl = this.router.url;
                                const nextUrl = this.panelData?.config.params.nextRoute;
                                const newUrl = oldUrl.replace('/new', '/' + model.id) + (nextUrl ? '/' + nextUrl : '');
                                this.router.navigateByUrl(newUrl); // replace /new by /123
                            } else {
                                this.router.navigate(['..', model.id], {relativeTo: this.route});
                            }
                        }
                    },
                });
            });
    }

    public delete(redirectionRoute?: unknown[]): void {
        this.alertService
            .confirm(
                $localize`Suppression`,
                $localize`Voulez-vous supprimer définitivement cet élément ?`,
                $localize`Supprimer définitivement`,
            )
            .subscribe(confirmed => {
                if (confirmed) {
                    this.preDelete(this.data.model);
                    this.form.disable();

                    this.service
                        .delete([this.data.model])
                        .pipe(finalize(() => this.form.enable()))
                        .subscribe(() => {
                            this.alertService.info($localize`Supprimé`);

                            if (!this.isPanel) {
                                const defaultRoute = ['../../' + kebabCase(this.key)];
                                this.router.navigate(redirectionRoute ? redirectionRoute : defaultRoute, {
                                    relativeTo: this.route,
                                });
                            } else {
                                this.panelService?.goToPenultimatePanel();
                            }
                        });
                }
            });
    }

    protected postUpdate(model: ExtractTupdate<TService>): void {}

    /**
     * Returns an observable that will be subscribed to immediately and the
     * redirect navigation will only happen after the observable completes.
     */
    protected postCreate(model: ExtractTcreate<TService>): Observable<unknown> {
        return EMPTY;
    }

    protected preDelete(model: ExtractTone<TService>): void {}

    protected initForm(): void {
        this.form = this.service.getFormGroup(this.data.model);
    }

    /**
     * Merge values of form into `this.data.model`.
     */
    protected formToData(): void {
        mergeWith(this.data.model, this.form.value, mergeOverrideArray);
    }
}
