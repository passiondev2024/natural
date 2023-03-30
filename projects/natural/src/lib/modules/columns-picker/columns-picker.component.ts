import {Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges} from '@angular/core';
import {AvailableColumn} from './types';
import {cancellableTimeout} from '../../classes/rxjs';
import {Subject} from 'rxjs';

@Component({
    selector: 'natural-columns-picker',
    templateUrl: './columns-picker.component.html',
})
export class NaturalColumnsPickerComponent implements OnChanges, OnDestroy {
    private _selections?: string[];
    private _availableColumns: Required<AvailableColumn>[] = [];

    /**
     * Set all the columns that are available.
     */
    @Input()
    public set availableColumns(columns: Readonly<Readonly<AvailableColumn>[]> | undefined) {
        this._availableColumns =
            columns?.map(column => {
                return {
                    checked: true,
                    hidden: false,
                    ...column,
                };
            }) ?? [];
    }

    /**
     * Set the columns that we would like to select but might be unavailable.
     *
     * If a column is unavailable it will be ignored silently. To know what columns were actually applied
     * you should use `selectionChange`.
     *
     * It is often set once on component initialization, but it can also be set again later in the lifespan of the component.
     */
    @Input()
    public set selections(columns: string[] | undefined) {
        this._selections = columns;

        if (!columns || !this._availableColumns.length) {
            return;
        }

        this._availableColumns.forEach(col => {
            col.checked = columns.includes(col.id);
        });
    }

    /**
     * Emit a list of valid and selected column keys whenever the selection changes
     */
    @Output() public readonly selectionChange = new EventEmitter<string[]>();

    /**
     * Displayed options in the dropdown menu
     */
    public displayedColumns: Required<AvailableColumn>[] = [];

    private readonly ngUnsubscribe = new Subject<void>();

    private initColumns(): void {
        this._availableColumns?.forEach(col => {
            col.checked = this._selections?.length ? this._selections.includes(col.id) : col.checked;
        });

        // Show options only for columns that are not hidden
        this.displayedColumns = this._availableColumns.filter(col => !col.hidden) ?? [];
    }

    public updateColumns(): void {
        const selectedColumns = this._availableColumns.filter(col => col.checked).map(col => col.id);
        this.selectionChange.emit(selectedColumns);
    }

    public ngOnDestroy(): void {
        this.ngUnsubscribe.next(); // unsubscribe everybody
        this.ngUnsubscribe.complete(); // complete the stream, because we will never emit again
    }

    public ngOnChanges(changes: SimpleChanges): void {
        // Unfortunately need a timeout to avoid an ExpressionChangedAfterItHasBeenCheckedError on /state/4989/process
        cancellableTimeout(this.ngUnsubscribe).subscribe(() => {
            if (changes.availableColumns) {
                this.initColumns();
                this.updateColumns();
            } else if (changes.selections) {
                this.updateColumns();
            }
        });
    }
}
