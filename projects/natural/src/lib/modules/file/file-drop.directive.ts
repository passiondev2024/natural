import {Directive, EventEmitter, HostListener, Output} from '@angular/core';
import {NaturalAbstractFile} from './abstract-file';

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
        if (this.fileDropDisabled) {
            this.stopEvent(event);
            return;
        }

        this.closeDrags();

        const files = this.eventToFiles(event);
        if (!files.length) {
            return;
        }

        this.stopEvent(event);
        this.handleFiles(files);
    }

    @HostListener('dragover', ['$event'])
    public onDragOver(event: DragEvent): void {
        if (this.fileDropDisabled) {
            this.stopEvent(event);
            return;
        }

        // change cursor and such
        const transfer = event.dataTransfer;
        if (transfer) {
            transfer.dropEffect = 'copy';
        }

        this.fileOver.emit(true);

        this.stopEvent(event);
    }

    private closeDrags(): void {
        this.fileOver.emit(false);
    }

    @HostListener('dragleave', ['$event'])
    public onDragLeave(event: DragEvent): void {
        if (this.fileDropDisabled) {
            this.stopEvent(event);
            return;
        }

        this.closeDrags();

        this.stopEvent(event);
    }
}
