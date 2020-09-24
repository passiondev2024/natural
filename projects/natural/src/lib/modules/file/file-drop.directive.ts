import {Directive, EventEmitter, HostListener, Input, Output} from '@angular/core';
import {NaturalAbstractFile} from './abstract-file';

type DragStatus = 'none' | 'valid' | 'invalid';

@Directive({
    selector: '[naturalFileDrop]',
})
export class NaturalFileDropDirective extends NaturalAbstractFile {
    @Output() public statusChange: EventEmitter<DragStatus> = new EventEmitter<DragStatus>();

    @HostListener('drop', ['$event'])
    public onDrop(event: Event): void {
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
    public onDragOver(event: Event): void {
        if (this.fileDropDisabled) {
            this.stopEvent(event);
            return;
        }

        const transfer = this.eventToTransfer(event);

        const files = this.eventToFiles(event);

        // Safari, IE11 & some browsers do NOT tell you about dragged files until
        // dropped. So we start by assuming the drag is valid, and see if we are able to double-check
        let status: DragStatus = 'valid';
        if (files.length) {
            status = this.isFilesValid(files) ? 'valid' : 'invalid';
        }

        this.statusChange.emit(status);

        // change cursor and such
        if (transfer) {
            transfer.dropEffect = 'copy';
        }

        this.stopEvent(event);
    }

    private closeDrags(): void {
        this.statusChange.emit('none');
    }

    @HostListener('dragleave', ['$event'])
    public onDragLeave(event: Event): any {
        if (this.fileDropDisabled) {
            this.stopEvent(event);
            return;
        }

        this.closeDrags();

        if ((this as any).element) {
            if (event.currentTarget === (this as any).element[0]) {
                return;
            }
        }

        this.stopEvent(event);
        this.statusChange.emit('none');
    }
}
