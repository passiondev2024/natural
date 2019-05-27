import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSelectionList } from '@angular/material';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { FilterGroupConditionField, Scalar } from '../../search/classes/graphql-doctrine.types';
import { NaturalDropdownRef } from '../../search/dropdown-container/dropdown-ref';
import { NATURAL_DROPDOWN_DATA, NaturalDropdownData } from '../../search/dropdown-container/dropdown.service';
import { DropdownComponent } from '../../search/types/DropdownComponent';

export type TypeSelectItem =
    Scalar
    | {
    id: Scalar;
    name: Scalar;
}
    | {
    value: Scalar;
    name: Scalar;
};

export interface TypeSelectConfiguration {
    items: TypeSelectItem[] | Observable<TypeSelectItem[]>;
    multiple?: boolean;
}

@Component({
    templateUrl: './type-select.component.html',
})
export class TypeSelectComponent implements DropdownComponent, OnInit, OnDestroy {

    public renderedValue = new BehaviorSubject<string>('');
    @ViewChild(MatSelectionList) list: MatSelectionList;
    private configuration: TypeSelectConfiguration;
    public selected: Scalar[] = [];
    public items: TypeSelectItem[] = [];
    private readonly subscription: Subscription;

    private readonly defaults: TypeSelectConfiguration = {
        items: [],
        multiple: true,
    };

    private dirty = false;

    constructor(@Inject(NATURAL_DROPDOWN_DATA) data: NaturalDropdownData,
                protected dropdownRef: NaturalDropdownRef,
                private changeDetectorRef: ChangeDetectorRef) {
        this.configuration = {...this.defaults, ...data.configuration as TypeSelectConfiguration};

        const wantedIds = (data.condition && data.condition.in) ? data.condition.in.values : [];
        if (Array.isArray(this.configuration.items)) {
            this.items = this.configuration.items;
            this.reloadSelection(wantedIds);
        } else {
            this.subscription = this.configuration.items.subscribe(items => {
                this.items = items;
                this.reloadSelection(wantedIds);

                // Without this, the dropdown would not show its content until user interact with the page (click or key press)
                this.changeDetectorRef.markForCheck();
            });
        }
    }

    ngOnInit(): void {
        if (!this.isMultiple()) {
            (this.list.selectedOptions as any)._multiple = false;
        }
    }

    ngOnDestroy(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    /**
     * Reload selection, according to possible values from configuration
     */
    private reloadSelection(wantedIds: Scalar[]): void {
        const possibleIds = this.items.map(item => this.getId(item));
        this.selected = wantedIds.filter(id => typeof possibleIds.find(i => i === id) !== 'undefined');
        this.renderedValue.next(this.getRenderedValue());
    }

    private isMultiple(): boolean {
        return !!this.configuration.multiple;
    }

    public getId(item: TypeSelectItem): Scalar {
        if (typeof item === 'object' && item) {
            return (item as any).id || (item as any).value;
        }

        return item as Scalar;
    }

    public getDisplay(item: TypeSelectItem): Scalar {
        if (typeof item === 'object' && item && item.name) {
            return item.name;
        }

        return item as Scalar;
    }

    private getItemById(id: Scalar): TypeSelectItem | undefined {
        return this.items.find(item => this.getId(item) === id);
    }

    public closeIfSingleAndHasValue(): void {
        this.dirty = true;
        if (this.isValid()) {
            this.renderedValue.next(this.getRenderedValue());

            if (!this.isMultiple()) {
                this.dropdownRef.close({
                    condition: this.getCondition(),
                });
            }
        }
    }

    public getCondition(): FilterGroupConditionField {
        return {
            in: {values: this.selected},
        };
    }

    private getRenderedValue(): string {
        if (!this.selected) {
            return '';
        }

        return this.selected.map(id => {
            const item = this.getItemById(id);
            if (item) {
                return this.getDisplay(item);
            }
        }).join(', ');
    }

    public isValid(): boolean {
        return this.selected.length > 0;
    }

    public isDirty(): boolean {
        return this.dirty;
    }

}
