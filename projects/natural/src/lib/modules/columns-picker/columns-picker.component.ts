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
    /**
     * Emit a list of column keys whenever the selection changes
     */
    @Output() selectionChange = new EventEmitter<string[]>();

    /**
     * Filter available columns
     */
    @Input() initialSelection?: string[];

    @ContentChildren(NaturalColumnsPickerColumnDirective)
    public availableColumns!: QueryList<NaturalColumnsPickerColumnDirective>;

    public displayedColumns: NaturalColumnsPickerColumnDirective[] = [];

    private ngUnsubscribe = new Subject<void>();

    constructor(private changeDetectorRef: ChangeDetectorRef) {}

    public ngAfterViewInit(): void {
        cancellableTimeout(this.ngUnsubscribe).subscribe(() => {
            this.initColumns();
            this.updateColumns();
            this.changeDetectorRef.detectChanges();
        });
    }

    private initColumns(): void {
        this.availableColumns.forEach(col => {
            col.checked = this.initialSelection ? this.initialSelection.includes(col.key) : col.checked;
        });

        this.displayedColumns = this.availableColumns.filter(col => !col.hidden);
    }

    public updateColumns(): void {
        const selectedColumns = this.availableColumns.filter(col => col.checked).map(col => col.key);

        this.selectionChange.emit(selectedColumns);
    }

    public ngOnDestroy(): void {
        this.ngUnsubscribe.next(); // required or complete() will not emit
        this.ngUnsubscribe.complete(); // unsubscribe everybody
    }
}
