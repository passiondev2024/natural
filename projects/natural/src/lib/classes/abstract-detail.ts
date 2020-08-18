import {Injector, OnInit} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {kebabCase, merge, mergeWith, omit} from 'lodash-es';
import {Observable} from 'rxjs';
import {NaturalAlertService} from '../modules/alert/alert.service';
import {NaturalAbstractPanel} from '../modules/panels/abstract-panel';
import {NaturalAbstractModelService, VariablesWithInput} from '../services/abstract-model.service';
import {NaturalIntlService} from '../services/intl.service';
import {Literal} from '../types/types';
import {finalize, shareReplay} from 'rxjs/operators';
import {validateAllFormControls} from './validators';
import {mergeOverrideArray} from './utility';

export class NaturalAbstractDetail<
    Tone,
    Vone extends {id: string},
    Tcreate extends {id: string},
    Vcreate extends VariablesWithInput,
    Tupdate,
    Vupdate extends {id: string; input: Literal},
    Tdelete,
    Vdelete extends {ids: string[]}
> extends NaturalAbstractPanel implements OnInit {
    public data: any = {
        model: {},
    };

    public form: FormGroup = new FormGroup({});

    public showFabButton = true;

    protected alertService: NaturalAlertService;
    protected router: Router;
    protected route: ActivatedRoute;
    protected intlService: NaturalIntlService;

    constructor(
        protected key: string,
        public service: NaturalAbstractModelService<
            Tone,
            Vone,
            any,
            any,
            Tcreate,
            Vcreate,
            Tupdate,
            Vupdate,
            Tdelete,
            Vdelete
        >,
        protected injector: Injector,
    ) {
        super();

        this.alertService = injector.get(NaturalAlertService);
        this.router = injector.get(Router);
        this.route = injector.get(ActivatedRoute);
        this.intlService = injector.get(NaturalIntlService);
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

        if (this.form.invalid) {
            return;
        }

        this.formToData();
        const callback = (model: Tupdate) => {
            this.alertService.info(this.intlService.updated);
            this.form.patchValue(model);
            this.postUpdate(model);
        };

        if (now) {
            this.service.updateNow(this.data.model).subscribe(callback);
        } else {
            this.service.update(this.data.model).subscribe(callback);
        }
    }

    public create(redirect: boolean = true): Observable<Tcreate> | null {
        validateAllFormControls(this.form);

        if (this.form.invalid) {
            return null;
        }

        this.formToData();
        this.form.disable();

        const obs = this.service.create(this.data.model).pipe(
            finalize(() => this.form.enable()),
            shareReplay(),
        );

        obs.subscribe(model => {
            this.alertService.info(this.intlService.created);
            this.form.patchValue(model);
            this.postCreate(model);

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
        });

        return obs;
    }

    public delete(redirectionRoute?: unknown[]): void {
        this.alertService
            .confirm(
                this.intlService.deleteConfirmTitle,
                this.intlService.deleteConfirmBody,
                this.intlService.deleteConfirmButton,
            )
            .subscribe(confirmed => {
                if (confirmed) {
                    this.preDelete(this.data.model);
                    this.form.disable();

                    this.service
                        .delete([this.data.model])
                        .pipe(finalize(() => this.form.enable()))
                        .subscribe(() => {
                            this.alertService.info(this.intlService.deleted);

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

    protected postUpdate(model: Tupdate): void {}

    protected postCreate(model: Tcreate): void {}

    protected preDelete(model: Tone): void {}

    protected initForm(): void {
        this.form = this.service.getFormGroup(this.data.model);
    }

    protected formToData(): void {
        mergeWith(this.data.model, this.form.value, mergeOverrideArray);
    }
}
