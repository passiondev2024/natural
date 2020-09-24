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

export interface InvalidFileItem {
    file: File;
    type: string;
}

/**
 * A master base set of logic intended to support file select/drag/drop operations
 * NOTE: Use ngfDrop for full drag/drop. Use ngfSelect for selecting
 */
@Directive()
export abstract class NaturalAbstractFile implements OnInit, OnDestroy, OnChanges {
    private fileElm?: HTMLInputElement;
    private filters: {name: string; fn: (file: File) => boolean}[] = [];
    private lastFileCount = 0;

    @Input() public multiple!: string;
    @Input() public accept!: string;
    @Input() public maxSize!: number;

    @Input() public fileDropDisabled = false;
    @Input() public selectable = false;

    @Output() public invalidFilesChange: EventEmitter<{file: File; type: string}[]> = new EventEmitter();
    @Output() public fileChange: EventEmitter<File> = new EventEmitter();
    @Output() public filesChange: EventEmitter<File[]> = new EventEmitter<File[]>();

    private files: File[] = [];

    constructor(public element: ElementRef) {
        this.initFilters();
    }

    private initFilters(): void {
        // the order is important
        this.filters.push({name: 'accept', fn: this.acceptFilter});
        this.filters.push({name: 'fileSize', fn: this.fileSizeFilter});
    }

    public ngOnDestroy(): void {
        delete this.fileElm; // faster memory release of dom element
    }

    public ngOnInit(): void {
        if (this.selectable) {
            this.enableSelecting();
        }

        if (this.multiple) {
            this.paramFileElm().setAttribute('multiple', this.multiple);
        }
    }

    public ngOnChanges(changes: SimpleChanges): void {
        if (changes.accept) {
            this.paramFileElm().setAttribute('accept', changes.accept.currentValue || '*');
        }
    }

    private paramFileElm(): HTMLInputElement {
        if (this.fileElm) {
            return this.fileElm;
        } // already defined

        // elm is a file input
        const isFile = isFileInput(this.element.nativeElement);
        if (isFile) {
            return (this.fileElm = this.element.nativeElement);
        }

        // create foo file input
        const label = createInvisibleFileInputWrap();
        this.fileElm = label.getElementsByTagName('input')[0];
        this.fileElm.addEventListener('change', this.changeFn.bind(this));
        this.element.nativeElement.appendChild(label);

        return this.fileElm;
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

    private getValidFiles(files: FileList): File[] {
        const rtn: File[] = [];
        for (let x = files.length - 1; x >= 0; --x) {
            if (this.isFileValid(files[x])) {
                rtn.push(files[x]);
            }
        }
        return rtn;
    }

    private getInvalidFiles(files: FileList): InvalidFileItem[] {
        const rtn: InvalidFileItem[] = [];
        for (let x = files.length - 1; x >= 0; --x) {
            const failReason = this.getFailedFilterName(files[x]);
            if (failReason) {
                rtn.push({
                    file: files[x],
                    type: failReason,
                });
            }
        }
        return rtn;
    }

    protected handleFiles(files: FileList): void {
        const valids = this.getValidFiles(files);

        const lastInvalids = files.length !== valids.length ? this.getInvalidFiles(files) : [];

        this.invalidFilesChange.emit(lastInvalids);

        if (valids.length) {
            this.que(valids);
        }

        if (this.isEmptyAfterSelection()) {
            this.element.nativeElement.value = '';
        }
    }

    private que(files: File[]): void {
        this.files = this.files || [];
        Array.prototype.push.apply(this.files, files);

        // below break memory ref and doesnt act like a que
        // this.files = files//causes memory change which triggers bindings like <ngfFormData [files]="files"></ngfFormData>

        this.filesChange.emit(this.files);

        if (files.length) {
            this.fileChange.emit(files[0]);
        }

        // will be checked for input value clearing
        this.lastFileCount = this.files.length;
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
        this.handleFiles(fileList);
    }

    private clickHandler(evt: Event): boolean {
        const elm = this.element.nativeElement;
        if (elm.getAttribute('disabled') || this.fileDropDisabled) {
            return false;
        }

        // prevent the click if it is a swipe
        if (detectSwipe(evt)) {
            return true;
        }

        const fileElm = this.paramFileElm();
        fileElm.click();
        this.beforeSelect();

        return false;
    }

    private beforeSelect(): void {
        if (!this.fileElm) {
            return;
        }

        if (this.files && this.lastFileCount === this.files.length) {
            return;
        }

        // if no files in array, be sure browser doesnt prevent reselect of same file (see github issue 27)
        this.fileElm.value = '';
    }

    private isEmptyAfterSelection(): boolean {
        return !!this.element.nativeElement.attributes.multiple;
    }

    protected eventToTransfer(event: Event | DragEvent): DataTransfer | null {
        return 'dataTransfer' in event ? event.dataTransfer : null;
    }

    protected stopEvent(event: Event): any {
        event.preventDefault();
        event.stopPropagation();
    }

    protected eventToFiles(event: Event): FileList {
        const transfer = this.eventToTransfer(event);

        if (transfer?.files?.length) {
            return transfer.files;
        }

        const fileList = new FileList();
        if (transfer?.items.length) {
            // tslint:disable-next-line:prefer-for-of
            for (let i = 0; i < transfer.items.length; i++) {
                const file = transfer.items[i].getAsFile();
                if (file) {
                    fileList[fileList.length] = file;
                }
            }
        }

        return fileList;
    }

    @HostListener('change', ['$event'])
    public onChange(event: Event): void {
        const files: FileList = (this.element.nativeElement.files as FileList) || this.eventToFiles(event);

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

    private isFileValid(file: File): boolean {
        const noFilters = !this.accept && (!this.filters || !this.filters.length);
        if (noFilters) {
            return true; // we have no filters so all files are valid
        }

        return !this.getFailedFilterName(file);
    }

    protected isFilesValid(files: FileList): boolean {
        for (let x = files.length - 1; x >= 0; --x) {
            if (!this.isFileValid(files[x])) {
                return false;
            }
        }

        return true;
    }

    private acceptFilter(item: File): boolean {
        return acceptType(this.accept, item.type, item.name);
    }

    private fileSizeFilter(item: File): boolean {
        return !(this.maxSize && item.size > this.maxSize);
    }
}
