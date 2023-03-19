import {Component, Input, OnDestroy, OnInit, Optional, Self} from '@angular/core';
import {ControlValueAccessor, NgControl} from '@angular/forms';
import {MatDialogConfig} from '@angular/material/dialog';
import {Literal} from '../../../types/types';
import {HierarchicFiltersConfiguration} from '../../hierarchic-selector/classes/hierarchic-filters-configuration';
import {
    HierarchicDialogConfig,
    NaturalHierarchicConfiguration,
    NaturalHierarchicSelectorDialogService,
    OrganizedModelSelection,
} from '../../hierarchic-selector/public-api';
import {AbstractSelect} from '../abstract-select.component';

function defaultDisplayFn(item: Literal | null): string {
    if (!item) {
        return '';
    }

    return item.fullName || item.name || item.iban || item.id || item;
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
 */
@Component({
    selector: 'natural-select-hierarchic',
    templateUrl: './select-hierarchic.component.html',
    styleUrls: ['./select-hierarchic.component.scss'],
})
export class NaturalSelectHierarchicComponent
    extends AbstractSelect<Literal, string>
    implements OnInit, OnDestroy, ControlValueAccessor
{
    /**
     * If provided cause a new select button to appear
     */
    @Input() public selectLabel?: string;

    /**
     * Configuration for hierarchic relations
     *
     * It should be an array with at least one element with `selectableAtKey` configured, otherwise the selector will never open.
     */
    @Input() public config: NaturalHierarchicConfiguration[] | null = null;

    /**
     * Filters formatted for hierarchic selector
     */
    @Input() public filters?: HierarchicFiltersConfiguration;

    /**
     * The selected value as an object. The internal value is `internalCtrl.value`, and that is a string.
     */
    private value: Literal | null = null;

    /**
     * On Firefox, the combination of <input (focus)> event and dialog opening cause some strange bug where focus event is called multiple
     * times This prevents it.
     */
    private lockOpenDialog = false;

    public constructor(
        private readonly hierarchicSelectorDialogService: NaturalHierarchicSelectorDialogService,
        @Optional() @Self() ngControl: NgControl | null,
    ) {
        super(ngControl);
    }

    /**
     * Very important to return something, above all if [select]='displayedValue' attribute value is used
     */
    public getDisplayFn(): (item: Literal | null) => string {
        if (this.displayWith) {
            return this.displayWith;
        }

        return defaultDisplayFn;
    }

    /**
     * Override parent because our internalCtrl store the textual representation as string instead of raw Literal
     */
    public override writeValue(value: Literal | string | null): void {
        this.value = value as Literal;
        this.internalCtrl.setValue(this.getDisplayFn()(this.value));
    }

    public openDialog(): void {
        if (this.internalCtrl.disabled) {
            return;
        }

        if (this.lockOpenDialog) {
            return;
        }

        const selectAtKey = this.getSelectKey();
        if (!selectAtKey || !this.config) {
            return;
        }

        this.lockOpenDialog = true;

        if (this.onTouched) {
            this.onTouched();
        }

        const selected: OrganizedModelSelection = {};

        if (this.internalCtrl.value) {
            selected[selectAtKey] = [this.value];
        }

        const hierarchicConfig: HierarchicDialogConfig = {
            hierarchicConfig: this.config,
            hierarchicSelection: selected,
            hierarchicFilters: this.filters,
            multiple: false,
        };

        const dialogFocus: MatDialogConfig = {restoreFocus: false};

        this.hierarchicSelectorDialogService
            .open(hierarchicConfig, dialogFocus)
            .afterClosed()
            .subscribe(result => {
                this.lockOpenDialog = false;
                if (result && result.hierarchicSelection) {
                    const selection = result.hierarchicSelection;
                    // Find the only selection amongst all possible keys
                    const keyWithSelection = Object.keys(selection).find(key => selection[key][0]);
                    const singleSelection = keyWithSelection ? selection[keyWithSelection][0] : null;

                    this.writeValue(singleSelection);
                    this.propagateValue(singleSelection);
                }
            });
    }

    public showSelectButton(): boolean {
        return !!(this.internalCtrl?.enabled && this.selectLabel && this.getSelectKey());
    }

    private getSelectKey(): string | undefined {
        return this.config?.filter(c => !!c.selectableAtKey)[0]?.selectableAtKey;
    }
}
