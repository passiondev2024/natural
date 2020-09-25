// tslint:disable:directive-class-suffix
import {
    Directive,
    EventEmitter,
    ElementRef,
    Input,
    Output,
    HostListener,
    OnInit,
    OnDestroy,
    OnChanges,
    SimpleChanges,
} from '@angular/core';
import {acceptType, createInvisibleFileInputWrap, isFileInput, detectSwipe} from './utils';

export interface InvalidFile {
    file: File;
    error: string;
}

function fileListToArray(fileList: FileList): File[] {
    const result: File[] = [];
    for (let i = 0; i < fileList.length; i++) {
        const file = fileList.item(i);
        if (file) {
            result.push(file);
        }
    }

    return result;
}

function dataTransferItemListToArray(items: DataTransferItemList): File[] {
    const result: File[] = [];

    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < items.length; i++) {
        const file = items[i].getAsFile();
        if (file) {
            result.push(file);
        }
    }

    return result;
}

/**
 * A master base set of logic intended to support file select/drag/drop operations
 * NOTE: Use ngfDrop for full drag/drop. Use ngfSelect for selecting
 */
@Directive()
export abstract class NaturalAbstractFile implements OnInit, OnDestroy, OnChanges {
    private fileElement?: HTMLInputElement;
    private filters: {name: string; fn: (file: File) => boolean}[] = [];

    @Input() public multiple = false;
    @Input() public accept = '';
    @Input() public maxSize!: number;

    @Input() public fileDropDisabled = false;
    @Input() public selectable = false;

    @Output() public fileChange: EventEmitter<File> = new EventEmitter();
    @Output() public filesChange: EventEmitter<File[]> = new EventEmitter<File[]>();
    @Output() public invalidFilesChange: EventEmitter<InvalidFile[]> = new EventEmitter();

    constructor(private readonly element: ElementRef<HTMLElement>) {
        this.initFilters();
    }

    private initFilters(): void {
        // the order is important
        this.filters.push({name: 'accept', fn: this.acceptFilter});
        this.filters.push({name: 'fileSize', fn: this.fileSizeFilter});
    }

    public ngOnDestroy(): void {
        delete this.fileElement; // faster memory release of dom element
    }

    public ngOnInit(): void {
        if (this.selectable) {
            this.enableSelecting();
        }

        this.getFileElement().multiple = this.multiple;
    }

    public ngOnChanges(changes: SimpleChanges): void {
        if (changes.accept) {
            this.getFileElement().setAttribute('accept', changes.accept.currentValue || '*');
        }
    }

    private getFileElement(): HTMLInputElement {
        if (this.fileElement) {
            return this.fileElement;
        }

        // elm is a file input
        if (isFileInput(this.element.nativeElement)) {
            this.fileElement = this.element.nativeElement;

            return this.fileElement;
        }

        // create foo file input
        const label = createInvisibleFileInputWrap();
        this.fileElement = label.getElementsByTagName('input')[0];
        this.fileElement.addEventListener('change', this.changeFn.bind(this));
        this.element.nativeElement.appendChild(label);

        return this.fileElement;
    }

    private enableSelecting(): void {
        const elm = this.element.nativeElement;

        if (isFileInput(elm)) {
            const bindedHandler = () => this.beforeSelect();
            elm.addEventListener('click', bindedHandler);
            elm.addEventListener('touchstart', bindedHandler);
            return;
        } else {
            const bindedHandler = (event: Event) => this.clickHandler(event);
            elm.addEventListener('click', bindedHandler);
            elm.addEventListener('touchstart', bindedHandler);
            elm.addEventListener('touchend', bindedHandler);
        }
    }

    protected handleFiles(files: File[]): void {
        const valids: File[] = [];
        const invalids: InvalidFile[] = [];

        for (const file of files) {
            const failReason = this.getFailedFilterName(file);
            if (failReason) {
                invalids.push({
                    file: file,
                    error: failReason,
                });
            } else {
                valids.push(file);
            }
        }

        if (invalids.length) {
            this.invalidFilesChange.emit(invalids);
        }

        if (valids.length) {
            this.fileChange.emit(valids[0]);
            this.filesChange.emit(valids);
        }

        this.getFileElement().value = '';
    }

    /** called when input has files */
    private changeFn(event: Event): void {
        if (!(event.target instanceof HTMLInputElement)) {
            return;
        }

        const fileList = event.target.files;

        if (!fileList) {
            return;
        }

        this.stopEvent(event);
        this.handleFiles(fileListToArray(fileList));
    }

    private clickHandler(event: Event): boolean {
        const elm = this.element.nativeElement;
        if (elm.getAttribute('disabled') || this.fileDropDisabled) {
            return false;
        }

        // prevent the click if it is a swipe
        if (detectSwipe(event)) {
            return true;
        }

        const fileElm = this.getFileElement();
        fileElm.click();
        this.beforeSelect();

        return false;
    }

    private beforeSelect(): void {
        if (!this.fileElement) {
            return;
        }

        // if no files in array, be sure browser doesnt prevent reselect of same file (see github issue 27)
        this.fileElement.value = '';
    }

    protected stopEvent(event: Event): void {
        event.preventDefault();
        event.stopPropagation();
    }

    protected eventToFiles(event: Event | DragEvent): File[] {
        const transfer = 'dataTransfer' in event ? event.dataTransfer : null;
        if (transfer?.files?.length) {
            return fileListToArray(transfer.files);
        }

        if (transfer) {
            return dataTransferItemListToArray(transfer.items);
        }

        return [];
    }

    @HostListener('change', ['$event'])
    public onChange(event: Event): void {
        const fileList = this.getFileElement().files;
        const files: File[] = fileList ? fileListToArray(fileList) : this.eventToFiles(event);

        if (!files.length) {
            return;
        }

        this.stopEvent(event);
        this.handleFiles(files);
    }

    private getFailedFilterName(file: File): string | undefined {
        for (const filter of this.filters) {
            if (!filter.fn.call(this, file)) {
                return filter.name;
            }
        }

        return undefined;
    }

    private acceptFilter(item: File): boolean {
        return acceptType(this.accept, item.type, item.name);
    }

    private fileSizeFilter(item: File): boolean {
        return !(this.maxSize && item.size > this.maxSize);
    }
}
