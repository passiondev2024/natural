import {Directive, EventEmitter, HostBinding, HostListener, OnInit, Output} from '@angular/core';
import {NaturalAbstractFile} from './abstract-file';
import {eventToFiles, stopEvent} from './utils';
import {asyncScheduler, Subject} from 'rxjs';
import {takeUntil, throttleTime} from 'rxjs/operators';

/**
 * This directive has all options to select files, included drag'n'drop.
 *
 * In most cases you probably also want click-to-select, so you should use:
 *
 *     <div naturalFileDrop [selectable]="true"></div>
 *
 */
@Directive({
    selector: ':not([naturalFileSelect])[naturalFileDrop]',
})
export class NaturalFileDropDirective extends NaturalAbstractFile implements OnInit {
    @HostBinding('class.natural-file-over') public fileOverClass = false;

    /**
     * Emits whenever files are being dragged over
     */
    @Output() public fileOver: EventEmitter<boolean> = new EventEmitter<boolean>();

    private readonly rawFileOver = new Subject<boolean>();

    public ngOnInit(): void {
        super.ngOnInit();

        // Automatically change the class, but not too often to avoid visual
        // flickering in Chrome when hovering across child HTML element of our host.
        // It's not absolutely perfect and if dragging slowly and precisely we can
        // still see flicker, but it should be better for most normal usages.
        this.rawFileOver
            .pipe(
                takeUntil(this.ngUnsubscribe),
                throttleTime(200, asyncScheduler, {
                    leading: true,
                    trailing: true,
                }),
            )
            .subscribe(fileOver => {
                this.fileOver.emit(fileOver);
                this.fileOverClass = fileOver;
            });
    }

    @HostListener('drop', ['$event'])
    public onDrop(event: DragEvent): void {
        if (this.fileSelectionDisabled) {
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

        if (this.fileSelectionDisabled) {
            return;
        }

        stopEvent(event);

        // Change cursor
        const transfer = event.dataTransfer;
        if (transfer) {
            transfer.dropEffect = 'copy';
        }

        this.rawFileOver.next(true);
    }

    private closeDrags(): void {
        this.rawFileOver.next(false);
    }

    @HostListener('dragleave', ['$event'])
    public onDragLeave(event: DragEvent): void {
        if (this.fileSelectionDisabled) {
            return;
        }

        stopEvent(event);
        this.closeDrags();
    }

    private hasObservers(): boolean {
        return (
            this.fileChange.observers.length > 0 ||
            this.filesChange.observers.length > 0 ||
            this.naturalFileService.filesChanged.observers.length > 0
        );
    }
}
