import {Directive, EventEmitter, HostBinding, HostListener, Output} from '@angular/core';
import {NaturalAbstractFile} from './abstract-file';
import {eventToFiles, stopEvent} from './utils';

@Directive({
    selector: '[naturalFileDrop]',
})
export class NaturalFileDropDirective extends NaturalAbstractFile {
    @HostBinding('class.natural-file-over') public fileOverClass = false;

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
        if (!this.hasObservers()) {
            return;
        }

        stopEvent(event);

        if (this.fileSelectionDisabled) {
            return;
        }

        // Change cursor
        const transfer = event.dataTransfer;
        if (transfer) {
            transfer.dropEffect = 'copy';
        }

        this.setFileOver(true);
    }

    private closeDrags(): void {
        this.setFileOver(false);
    }

    @HostListener('dragleave', ['$event'])
    public onDragLeave(event: DragEvent): void {
        stopEvent(event);
        if (this.fileSelectionDisabled) {
            return;
        }

        this.closeDrags();
    }

    private setFileOver(fileOver: boolean): void {
        this.fileOver.emit(fileOver);
        this.fileOverClass = fileOver;
    }

    private hasObservers(): boolean {
        return (
            this.fileChange.observers.length > 0 ||
            this.filesChange.observers.length > 0 ||
            this.invalidFilesChange.observers.length > 0 ||
            this.naturalFileService.filesChanged.observers.length > 0
        );
    }
}
