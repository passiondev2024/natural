import { Injector, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { isArray, kebabCase, merge, mergeWith, omit } from 'lodash';
import { Observable, Subject } from 'rxjs';
import { NaturalAlertService } from '../modules/alert/alert.service';
import { NaturalAbstractPanel } from '../modules/panels/abstract-panel';
import { NaturalAbstractModelService, VariablesWithInput } from '../services/abstract-model.service';
import { NaturalIntlService } from '../services/intl.service';
import { Literal } from '../types/types';

export class NaturalAbstractDetail<Tone,
    Vone extends { id: string; },
    Tcreate extends { id: string; },
    Vcreate extends VariablesWithInput,
    Tupdate,
    Vupdate extends { id: string; input: Literal; },
    Tdelete>
    extends NaturalAbstractPanel implements OnInit {

    public data: any = {
        model: {},
    };

    public form: FormGroup;

    public showFabButton = true;

    protected alertService: NaturalAlertService;
    protected router: Router;
    protected route: ActivatedRoute;
    protected intlService: NaturalIntlService;

    constructor(
        protected key: string,
        public service: NaturalAbstractModelService<Tone, Vone, any, any, Tcreate, Vcreate, Tupdate, Vupdate, Tdelete>,
        protected injector: Injector,
    ) {
        super();

        this.alertService = injector.get(NaturalAlertService);
        this.router = injector.get(Router);
        this.route = injector.get(ActivatedRoute);
        this.intlService = injector.get(NaturalIntlService);
    }

    public static getFormGroup(model, service): FormGroup {
        const formConfig = service.getFormConfig(model);
        return new FormGroup(formConfig, {
            validators: service.getFormGroupValidators(model),
            asyncValidators: service.getFormGroupAsyncValidators(model),
        });
    }

    /**
     * Recursively mark descending form tree as dirty and touched in order to show all unvalidated fields on demand (create action mainly)
     */
    public static validateAllFormFields(form: FormGroup | FormArray): void {
        Object.keys(form.controls).forEach(field => {
            const control = form.get(field);
            if (control instanceof FormControl) {
                control.markAsDirty({onlySelf: true});
                control.markAsTouched({onlySelf: true});
            } else if (control instanceof FormGroup || control instanceof FormArray) {
                NaturalAbstractDetail.validateAllFormFields(control);
            }
        });
    }

    ngOnInit(): void {

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

    public changeTab(index) {
        this.showFabButton = index === 0;
    }

    public update(now: boolean = false): void {

        if (!this.data.model.id) {
            return;
        }

        NaturalAbstractDetail.validateAllFormFields(this.form);

        if (this.form && this.form.invalid) {
            return;
        }

        if (this.form) {
            this.formToData();
        }
        const callback = (model: Tupdate) => {
            this.alertService.info(this.intlService.updated);
            if (this.form) {
                this.form.patchValue(model);
            }
            this.postUpdate(model);
        };

        if (now) {
            this.service.updateNow(this.data.model).subscribe(callback);
        } else {
            this.service.update(this.data.model).subscribe(callback);
        }
    }

    public create(redirect: boolean = true): Observable<Tcreate> | null {

        NaturalAbstractDetail.validateAllFormFields(this.form);

        if (this.form && this.form.invalid) {
            return null;
        }

        if (this.form) {
            this.formToData();
        }

        const obs = new Subject<Tcreate>();
        this.service.create(this.data.model).subscribe(model => {
            this.alertService.info(this.intlService.created);
            obs.next(model);
            this.form.patchValue(model);
            this.postCreate(model);

            if (redirect) {
                if (this.isPanel) {
                    const oldUrl = this.router.url;
                    const nextUrl = this.panelData.config.params.nextRoute;
                    const newUrl = oldUrl.replace('/new', '/' + model.id) + (nextUrl ? '/' + nextUrl : '');
                    this.router.navigateByUrl(newUrl); // replace /new by /123
                } else {
                    this.router.navigate(['..', model.id], {relativeTo: this.route});
                }
            }
        });

        return obs;
    }

    public delete(redirectionRoute: unknown[]): void {
        this.alertService.confirm(this.intlService.deleteConfirmTitle,
            this.intlService.deleteConfirmBody,
            this.intlService.deleteConfirmButton)
            .subscribe(confirmed => {
                if (confirmed) {
                    this.preDelete(this.data.model);
                    this.service.delete([this.data.model]).subscribe(() => {
                        this.alertService.info(this.intlService.deleted);

                        if (!this.isPanel) {
                            const defaultRoute = ['../../' + kebabCase(this.key)];
                            this.router.navigate(redirectionRoute ? redirectionRoute : defaultRoute, {relativeTo: this.route});
                        } else {
                            this.panelService.goToPenultimatePanel();
                        }
                    });
                }
            });
    }

    protected postUpdate(model: Tupdate): void {
    }

    protected postCreate(model: Tcreate): void {
    }

    protected preDelete(model: any): void {
    }

    protected initForm(): void {
        this.form = NaturalAbstractDetail.getFormGroup(this.data.model, this.service);
    }

    protected formToData() {
        mergeWith(this.data.model, this.form.value, (dest, src) => {
            if (isArray(src)) {
                return src;
            }
        });
    }
}
