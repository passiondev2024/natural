import {Component, Input, OnDestroy, OnInit, Optional, Self} from '@angular/core';
import {ControlValueAccessor, FormControl, FormGroup, FormGroupDirective, NgControl, NgForm} from '@angular/forms';
import {MatDialogConfig} from '@angular/material/dialog';
import {HierarchicFiltersConfiguration} from '../../hierarchic-selector/classes/hierarchic-filters-configuration';
import {AbstractSelect} from '../abstract-select.component';
import {
    NaturalHierarchicConfiguration,
    NaturalHierarchicSelectorDialogService,
    HierarchicDialogConfig,
    HierarchicDialogResult,
} from '../../hierarchic-selector/public-api';
import {Literal} from '../../../types/types';
import {merge} from 'rxjs';
import {ErrorStateMatcher} from '@angular/material/core';

function defaultDisplayFn(item: Literal | null): string {
    if (!item) {
        return '';
    }

    return item.fullName || item.name || item.iban || item.id || item;
}

/**
 * This will completely ignore local formControl and instead use the one from the component
 * which comes from outside of this component. This basically allows us to **not** depend on
 * touched status propagation between outside and inside world, and thus get rid of our legacy
 * custom FormControl class ("NaturalFormControl").
 */
class ExternalFormControlMatcher implements ErrorStateMatcher {
    public constructor(private readonly component: NaturalSelectHierarchicComponent) {}

    public isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
        const formCtrl = this.component.formCtrl;
        if (formCtrl) {
            return !!formCtrl.errors && (formCtrl.touched || formCtrl.dirty);
        }

        return false;
    }
}

/**
 * Default usage:
 * <natural-select [config]="myConfig" [(ngModel)]="amazingModel"
 * (ngModelChange)=amazingChangeFn($event)></natural-select>
 *
 * [(ngModel)] and (ngModelChange) are optional
 *
 * Placeholder :
 * <natural-select placeholder="amazing placeholder">
 *
 * Never float placeholder :
 * <natural-select placeholder="amazing placeholder" floatPlaceholder="never">
 */
@Component({
    selector: 'natural-select-hierarchic',
    templateUrl: './select-hierarchic.component.html',
    styleUrls: ['./select-hierarchic.component.scss'],
})
export class NaturalSelectHierarchicComponent extends AbstractSelect
    implements OnInit, OnDestroy, ControlValueAccessor {
    /**
     * If provided cause a new select button to appear
     */
    @Input() selectLabel: string;

    /**
     * Configuration for hierarchic relations
     */
    @Input() config: NaturalHierarchicConfiguration[];

    /**
     * Filters formatted for hierarchic selector
     */
    @Input() filters: HierarchicFiltersConfiguration;

    /**
     * On Firefox, the combination of <input (focus)> event and dialog opening cause some strange bug where focus event is called multiple
     * times This prevents it.
     */
    private lockOpenDialog = false;

    /**
     * We need some kind of FormControl on the <input> so that Material can properly show error messages
     * when the control is touched and invalid. But we cannot use the existing formCtrl because
     * its value is an object and never a string. So we create an internal textCtrl that will
     * hold a purely string value and will be kept in sync with the "normal" formCtrl.
     */
    public textCtrl = new FormControl('');

    public matcher: ErrorStateMatcher;

    constructor(
        private readonly hierarchicSelectorDialogService: NaturalHierarchicSelectorDialogService,
        @Optional() @Self() ngControl: NgControl,
    ) {
        super(ngControl);
        this.matcher = new ExternalFormControlMatcher(this);
    }

    public ngOnInit(): void {
        super.ngOnInit();
        this.syncControls();

        merge(this.formCtrl.valueChanges, this.formCtrl.statusChanges).subscribe(() => this.syncControls());
    }

    /**
     * Very important to return something, above all if [select]='displayedValue' attribute value is used
     */
    public getDisplayFn(): (item: any) => string {
        if (this.displayWith) {
            return this.displayWith;
        }

        return defaultDisplayFn;
    }

    public openDialog(): void {
        if (this.formCtrl.disabled) {
            return;
        }

        if (this.lockOpenDialog) {
            return;
        }

        this.lockOpenDialog = true;
        this.formCtrl.markAsTouched();

        const selectAtKey = this.getSelectKey();
        const selected = {};

        if (this.formCtrl.value) {
            selected[selectAtKey] = [this.formCtrl.value];
        }

        const hierarchicConfig: HierarchicDialogConfig = {
            hierarchicConfig: this.config,
            hierarchicSelection: selected,
            hierarchicFilters: this.filters,
            multiple: false,
        };

        const dialogFocus: MatDialogConfig = {
            restoreFocus: false,
        };

        this.hierarchicSelectorDialogService
            .open(hierarchicConfig, dialogFocus)
            .afterClosed()
            .subscribe((result: HierarchicDialogResult) => {
                this.lockOpenDialog = false;
                if (result && result.hierarchicSelection) {
                    const selection = result.hierarchicSelection;
                    // Find the only selection amongst all possible keys
                    const keyWithSelection = Object.keys(selection).find(key => selection[key][0]);
                    const singleSelection = keyWithSelection ? selection[keyWithSelection][0] : null;

                    this.formCtrl.setValue(singleSelection);
                    this.propagateValue(singleSelection);
                }
            });
    }

    public showSelectButton(): boolean {
        return !!(this.formCtrl?.enabled && this.selectLabel && this.config);
    }

    private getSelectKey(): string {
        const selectKey = this.config.filter(c => !!c.selectableAtKey)[0].selectableAtKey;

        if (!selectKey) {
            throw new Error('Hierarchic selector must be configured with at least one selectableAtKey');
        }

        return selectKey;
    }

    private syncControls(): void {
        this.textCtrl.setValue(this.getDisplayFn()(this.formCtrl.value));
        this.textCtrl.setErrors(this.formCtrl.errors);

        if (this.formCtrl.status === 'DISABLED') {
            this.textCtrl.disable();
        } else {
            this.textCtrl.enable();
        }
    }
}