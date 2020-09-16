import {ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatSelectionList} from '@angular/material/list';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {FilterGroupConditionField, Scalar} from '../../search/classes/graphql-doctrine.types';
import {NaturalDropdownRef} from '../../search/dropdown-container/dropdown-ref';
import {NATURAL_DROPDOWN_DATA, NaturalDropdownData} from '../../search/dropdown-container/dropdown.service';
import {DropdownComponent} from '../../search/types/dropdown-component';
import {FormControl} from '@angular/forms';
import {NaturalAbstractController} from '../../../classes/abstract-controller';
import {takeUntil} from 'rxjs/operators';

export type TypeSelectItem =
    | Scalar
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
export class TypeSelectComponent extends NaturalAbstractController implements DropdownComponent, OnInit, OnDestroy {
    public renderedValue = new BehaviorSubject<string>('');
    @ViewChild(MatSelectionList, {static: true}) public list!: MatSelectionList;
    public formCtrl: FormControl = new FormControl([]);

    public items: TypeSelectItem[] = [];
    private configuration: TypeSelectConfiguration;

    private readonly defaults: TypeSelectConfiguration = {
        items: [],
        multiple: true,
    };

    constructor(
        @Inject(NATURAL_DROPDOWN_DATA) data: NaturalDropdownData<TypeSelectConfiguration>,
        protected dropdownRef: NaturalDropdownRef,
        private changeDetectorRef: ChangeDetectorRef,
    ) {
        super();
        this.configuration = {...this.defaults, ...data.configuration};

        const wantedIds = data.condition && data.condition.in ? data.condition.in.values : [];

        this.changeDetectorRef.markForCheck();
        const items$ = Array.isArray(this.configuration.items)
            ? of(this.configuration.items)
            : this.configuration.items;

        items$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(items => {
            this.items = items;
            this.reloadSelection(wantedIds);

            this.formCtrl.valueChanges
                .pipe(takeUntil(this.ngUnsubscribe))
                .subscribe(() => this.closeIfSingleAndHasValue());

            // Without this, the dropdown would not show its content until user interact with the page (click or key press)
            this.changeDetectorRef.markForCheck();
        });
    }

    public ngOnInit(): void {
        if (!this.isMultiple()) {
            (this.list.selectedOptions as any)._multiple = false;
        }
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

    public closeIfSingleAndHasValue(): void {
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
            in: {values: this.formCtrl.value},
        };
    }

    public isValid(): boolean {
        return this.formCtrl.value.length > 0;
    }

    public isDirty(): boolean {
        return this.formCtrl.dirty;
    }

    /**
     * Reload selection, according to possible values from configuration
     */
    private reloadSelection(wantedIds: Scalar[]): void {
        const possibleIds = this.items.map(item => this.getId(item));
        const wantedAndPossibleIds = wantedIds.filter(id => typeof possibleIds.find(i => i === id) !== 'undefined');
        this.formCtrl.setValue(wantedAndPossibleIds);
        this.renderedValue.next(this.getRenderedValue());
    }

    private isMultiple(): boolean {
        return !!this.configuration.multiple;
    }

    private getItemById(id: Scalar): TypeSelectItem | undefined {
        return this.items.find(item => this.getId(item) === id);
    }

    private getRenderedValue(): string {
        return this.formCtrl.value
            .map((id: Scalar) => {
                const item = this.getItemById(id);
                if (item) {
                    return this.getDisplay(item);
                }
            })
            .join(', ');
    }
}
