import {Directive, Injector, OnInit} from '@angular/core';
import {UntypedFormGroup} from '@angular/forms';
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
import {EMPTY, endWith, last, Observable, switchMap} from 'rxjs';

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
    public form: UntypedFormGroup = new UntypedFormGroup({});

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

    public constructor(
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

    public update(now = false): void {
        if (!this.data.model.id) {
            return;
        }

        validateAllFormControls(this.form);

        ifValid(this.form).subscribe(() => {
            this.formToData();
            const postUpdate = (model: ExtractTupdate<TService>): void => {
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

    public create(redirect = true): void {
        validateAllFormControls(this.form);

        if (!this.form.valid) {
            return;
        }

        this.formToData();
        this.form.disable();

        this.service
            .create(this.data.model)
            .pipe(
                switchMap(model => {
                    this.alertService.info($localize`Créé`);
                    this.form.patchValue(model);

                    return this.postCreate(model).pipe(endWith(model), last());
                }),
                switchMap(model => {
                    if (redirect) {
                        if (this.isPanel) {
                            const oldUrl = this.router.url;
                            const nextUrl = this.panelData?.config.params.nextRoute;
                            const newUrl = oldUrl.replace('/new', '/' + model.id) + (nextUrl ? '/' + nextUrl : '');
                            return this.router.navigateByUrl(newUrl); // replace /new by /123
                        } else {
                            return this.router.navigate(['..', model.id], {relativeTo: this.route});
                        }
                    }

                    return EMPTY;
                }),
                finalize(() => this.form.enable()),
            )
            .subscribe();
    }

    public delete(redirectionRoute?: unknown[]): void {
        this.form.disable();
        this.alertService
            .confirm(
                $localize`Suppression`,
                $localize`Voulez-vous supprimer définitivement cet élément ?`,
                $localize`Supprimer définitivement`,
            )
            .pipe(
                switchMap(confirmed => {
                    if (!confirmed) {
                        return EMPTY;
                    }

                    this.preDelete(this.data.model);

                    return this.service.delete([this.data.model]).pipe(
                        switchMap(() => {
                            this.alertService.info($localize`Supprimé`);

                            if (this.isPanel) {
                                this.panelService?.goToPenultimatePanel();

                                return EMPTY;
                            } else {
                                const defaultRoute = ['../../' + kebabCase(this.key)];
                                return this.router.navigate(redirectionRoute ? redirectionRoute : defaultRoute, {
                                    relativeTo: this.route,
                                });
                            }
                        }),
                    );
                }),
                finalize(() => this.form.enable()),
            )
            .subscribe();
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected postUpdate(model: ExtractTupdate<TService>): void {
        // noop
    }

    /**
     * Returns an observable that will be subscribed to immediately and the
     * redirect navigation will only happen after the observable completes.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected postCreate(model: ExtractTcreate<TService>): Observable<unknown> {
        return EMPTY;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected preDelete(model: ExtractTone<TService>): void {
        // noop
    }

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
