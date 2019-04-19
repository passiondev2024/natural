import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChildren,
    EventEmitter,
    Input,
    Output,
    QueryList,
} from '@angular/core';
import { NaturalColumnsPickerColumnDirective } from './columns-picker-column.directive';

@Component({
    selector: 'natural-columns-picker',
    templateUrl: './columns-picker.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NaturalColumnsPickerComponent implements AfterViewInit {

    /**
     * Emit a list of column keys whenever the selection changes
     */
    @Output() selectionChange = new EventEmitter<Iterable<string>>();

    /**
     * Filter available columns
     */
    @Input() initialSelection: string[];

    @ContentChildren(NaturalColumnsPickerColumnDirective)
    public availableColumns: QueryList<NaturalColumnsPickerColumnDirective>;

    public displayedColumns: NaturalColumnsPickerColumnDirective[];

    constructor(private changeDetectorRef: ChangeDetectorRef) {

    }

    ngAfterViewInit(): void {
        setTimeout(() => {
            this.initColumns();
            this.updateColumns();
            this.changeDetectorRef.detectChanges();
        });
    }

    initColumns(): void {
        this.availableColumns.forEach(col => {
            col.checked = this.initialSelection ? this.initialSelection.includes(col.key) : col.checked;
        });

        this.displayedColumns = this.availableColumns.filter(col => !col.hidden);
    }

    updateColumns(): void {
        const selectedColumns = this.availableColumns.filter(col => col.checked).map(col => col.key);

        this.selectionChange.emit(selectedColumns);
    }
}
