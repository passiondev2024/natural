import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChildren,
    EventEmitter,
    Input,
    OnDestroy,
    Output,
    QueryList,
} from '@angular/core';
import {NaturalColumnsPickerColumnDirective} from './columns-picker-column.directive';
import {cancellableTimeout} from '../../classes/rxjs';
import {Subject} from 'rxjs';

@Component({
    selector: 'natural-columns-picker',
    templateUrl: './columns-picker.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NaturalColumnsPickerComponent implements AfterViewInit, OnDestroy {
    @Input()
    public set selection(columns: string[]) {
        this.availableColumns?.forEach(col => {
            col.checked = columns.includes(col.key);
        });
    }

    /**
     * Define preselected (checked) columns at start
     */
    private _selections?: string[];
    @Input()
    public set selections(columns: string[] | undefined) {
        this._selections = columns;

        if (!columns || !this.availableColumns) {
            return;
        }

        this.selection = columns;
        this.updateColumns();
    }

    /**
     * Emit a list of column keys whenever the selection changes in the dropdown menu
     */
    @Output() public readonly selectionChange = new EventEmitter<string[]>();

    /**
     * Available columns are defined by options in the template
     */
    @ContentChildren(NaturalColumnsPickerColumnDirective)
    public availableColumns: QueryList<NaturalColumnsPickerColumnDirective> | null = null;

    /**
     * Displayed options in the dropdown menu
     */
    public displayedColumns: NaturalColumnsPickerColumnDirective[] = [];

    private ngUnsubscribe = new Subject<void>();

    constructor(private readonly changeDetectorRef: ChangeDetectorRef) {}

    public ngAfterViewInit(): void {
        cancellableTimeout(this.ngUnsubscribe).subscribe(() => {
            this.initColumns();
            this.updateColumns();
            this.changeDetectorRef.detectChanges();
        });
    }

    private initColumns(): void {
        this.availableColumns?.forEach(col => {
            col.checked = this._selections?.length ? this._selections.includes(col.key) : col.checked;
        });

        // Show options only for columns that are not hidden
        this.displayedColumns = this.availableColumns?.filter(col => !col.hidden) ?? [];
    }

    public updateColumns(): void {
        const selectedColumns = this.availableColumns?.filter(col => col.checked).map(col => col.key);
        this.selectionChange.emit(selectedColumns);
    }

    public ngOnDestroy(): void {
        this.ngUnsubscribe.next(); // unsubscribe everybody
        this.ngUnsubscribe.complete(); // complete the stream, because we will never emit again
    }
}
