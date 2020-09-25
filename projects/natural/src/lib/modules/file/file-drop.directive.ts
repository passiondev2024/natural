import {Directive, EventEmitter, HostListener, Output} from '@angular/core';
import {NaturalAbstractFile} from './abstract-file';
import {eventToFiles, stopEvent} from './utils';

@Directive({
    selector: '[naturalFileDrop]',
})
export class NaturalFileDropDirective extends NaturalAbstractFile {
    /**
     * Emits whenever files are being dragged over
     */
    @Output() public fileOver: EventEmitter<boolean> = new EventEmitter<boolean>();

    @HostListener('drop', ['$event'])
    public onDrop(event: DragEvent): void {
        if (this.fileSelectionDisabled) {
            stopEvent(event);
            return;
        }

        this.closeDrags();

        const files = eventToFiles(event);
        if (!files.length) {
            return;
        }

        stopEvent(event);
        this.handleFiles(files);
    }

    @HostListener('dragover', ['$event'])
    public onDragOver(event: DragEvent): void {
        stopEvent(event);

        if (this.fileSelectionDisabled) {
            return;
        }

        // change cursor and such
        const transfer = event.dataTransfer;
        if (transfer) {
            transfer.dropEffect = 'copy';
        }

        this.fileOver.emit(true);
    }

    private closeDrags(): void {
        this.fileOver.emit(false);
    }

    @HostListener('dragleave', ['$event'])
    public onDragLeave(event: DragEvent): void {
        stopEvent(event);
        if (this.fileSelectionDisabled) {
            return;
        }

        this.closeDrags();
    }
}
