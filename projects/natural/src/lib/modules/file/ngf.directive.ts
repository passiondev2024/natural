import {Directive, EventEmitter, ElementRef, Input, Output, HostListener} from '@angular/core';
import {createInvisibleFileInputWrap, isFileInput, detectSwipe} from './doc-event-help.functions';
import {acceptType, InvalidFileItem, dataUrl} from './fileTools';

export interface dragMeta {
    type: string;
    kind: string;
}

/** A master base set of logic intended to support file select/drag/drop operations
 NOTE: Use ngfDrop for full drag/drop. Use ngfSelect for selecting
 */
@Directive({
    selector: '[ngf]',
    exportAs: 'ngf',
})
export class ngf {
    fileElm: any;
    filters: {name: string; fn: (file: File) => boolean}[] = [];
    lastFileCount: number = 0;

    @Input() multiple!: string;
    @Input() accept!: string;
    @Input() maxSize!: number;

    @Input() fileDropDisabled: boolean = false;
    @Input() selectable: boolean = false;
    @Output('init') directiveInit: EventEmitter<ngf> = new EventEmitter();

    @Input() lastInvalids: InvalidFileItem[] = [];
    @Output() lastInvalidsChange: EventEmitter<{file: File; type: string}[]> = new EventEmitter();

    @Input() lastBaseUrl!: string; //base64 last file uploaded url
    @Output() lastBaseUrlChange: EventEmitter<string> = new EventEmitter();

    @Input() file!: File; //last file uploaded
    @Output() fileChange: EventEmitter<File> = new EventEmitter();

    @Input() files: File[] = [];
    @Output() filesChange: EventEmitter<File[]> = new EventEmitter<File[]>();

    constructor(public element: ElementRef) {
        this.initFilters();
    }

    initFilters() {
        // the order is important
        this.filters.push({name: 'accept', fn: this._acceptFilter});
        this.filters.push({name: 'fileSize', fn: this._fileSizeFilter});

    }

    ngOnDestroy() {
        delete this.fileElm; //faster memory release of dom element
    }

    ngOnInit() {
        if (this.selectable) {
            this.enableSelecting();
        }

        if (this.multiple) {
            this.paramFileElm().setAttribute('multiple', this.multiple);
        }

        //create reference to this class with one cycle delay to avoid ExpressionChangedAfterItHasBeenCheckedError
        setTimeout(() => {
            this.directiveInit.emit(this);
        }, 0);
    }

    ngOnChanges(changes) {
        if (changes.accept) {
            this.paramFileElm().setAttribute('accept', changes.accept.currentValue || '*');
        }
    }

    paramFileElm() {
        if (this.fileElm) {
            return this.fileElm;
        } //already defined

        //elm is a file input
        const isFile = isFileInput(this.element.nativeElement);
        if (isFile) {
            return (this.fileElm = this.element.nativeElement);
        }

        //create foo file input
        const label = createInvisibleFileInputWrap();
        this.fileElm = label.getElementsByTagName('input')[0];
        this.fileElm.addEventListener('change', this.changeFn.bind(this));
        this.element.nativeElement.appendChild(label);
        return this.fileElm;
    }

    enableSelecting() {
        let elm = this.element.nativeElement;

        if (isFileInput(elm)) {
            const bindedHandler = _ev => this.beforeSelect();
            elm.addEventListener('click', bindedHandler);
            elm.addEventListener('touchstart', bindedHandler);
            return;
        }

        const bindedHandler = ev => this.clickHandler(ev);
        elm.addEventListener('click', bindedHandler);
        elm.addEventListener('touchstart', bindedHandler);
        elm.addEventListener('touchend', bindedHandler);
    }

    getValidFiles(files: File[]): File[] {
        const rtn: File[] = [];
        for (let x = files.length - 1; x >= 0; --x) {
            if (this.isFileValid(files[x])) {
                rtn.push(files[x]);
            }
        }
        return rtn;
    }

    getInvalidFiles(files: File[]): InvalidFileItem[] {
        const rtn: InvalidFileItem[] = [];
        for (let x = files.length - 1; x >= 0; --x) {
            let failReason = this.getFileFilterFailName(files[x]);
            if (failReason) {
                rtn.push({
                    file: files[x],
                    type: failReason,
                });
            }
        }
        return rtn;
    }

    handleFiles(files: File[]) {
        const valids = this.getValidFiles(files);

        if (files.length != valids.length) {
            this.lastInvalids = this.getInvalidFiles(files);
        } else {
            delete this.lastInvalids;
        }

        this.lastInvalidsChange.emit(this.lastInvalids);

        if (valids.length) {
            this.que(valids);
        }

        if (this.isEmptyAfterSelection()) {
            this.element.nativeElement.value = '';
        }
    }

    que(files: File[]) {
        this.files = this.files || [];
        Array.prototype.push.apply(this.files, files);

        //below break memory ref and doesnt act like a que
        //this.files = files//causes memory change which triggers bindings like <ngfFormData [files]="files"></ngfFormData>

        this.filesChange.emit(this.files);

        if (files.length) {
            this.fileChange.emit((this.file = files[0]));

            if (this.lastBaseUrlChange.observers.length) {
                dataUrl(files[0]).then(url => this.lastBaseUrlChange.emit(url));
            }
        }

        //will be checked for input value clearing
        this.lastFileCount = this.files.length;
    }

    /** called when input has files */
    changeFn(event: any) {
        const fileList = event.__files_ || (event.target && event.target.files);

        if (!fileList) {
            return;
        }

        this.stopEvent(event);
        this.handleFiles(fileList);
    }

    clickHandler(evt: any) {
        const elm = this.element.nativeElement;
        if (elm.getAttribute('disabled') || this.fileDropDisabled) {
            return false;
        }

        const r = detectSwipe(evt);
        // prevent the click if it is a swipe
        if (r !== false) {
            return r;
        }

        const fileElm = this.paramFileElm();
        fileElm.click();
        this.beforeSelect();

        return false;
    }

    beforeSelect() {
        if (this.files && this.lastFileCount === this.files.length) {
            return;
        }

        //if no files in array, be sure browser doesnt prevent reselect of same file (see github issue 27)
        this.fileElm.value = null;
    }

    isEmptyAfterSelection(): boolean {
        return !!this.element.nativeElement.attributes.multiple;
    }

    eventToTransfer(event: any): any {
        if (event.dataTransfer) {
            return event.dataTransfer;
        }
        return event.originalEvent ? event.originalEvent.dataTransfer : null;
    }

    stopEvent(event: any): any {
        event.preventDefault();
        event.stopPropagation();
    }


    eventToFiles(event: Event) {
        const transfer = this.eventToTransfer(event);
        if (transfer) {
            if (transfer.files && transfer.files.length) {
                return transfer.files;
            }
            if (transfer.items && transfer.items.length) {
                return transfer.items;
            }
        }
        return [];
    }

    @HostListener('change', ['$event'])
    onChange(event: Event): void {
        let files = this.element.nativeElement.files || this.eventToFiles(event);

        if (!files.length) {
            return;
        }

        this.stopEvent(event);
        this.handleFiles(files);
    }

    getFileFilterFailName(file: File): string | undefined {
        for (let i = 0; i < this.filters.length; i++) {
            if (!this.filters[i].fn.call(this, file)) {
                return this.filters[i].name;
            }
        }
        return undefined;
    }

    isFileValid(file: File): boolean {
        const noFilters = !this.accept && (!this.filters || !this.filters.length);
        if (noFilters) {
            return true; //we have no filters so all files are valid
        }

        return this.getFileFilterFailName(file) ? false : true;
    }

    isFilesValid(files: File[]) {
        for (let x = files.length - 1; x >= 0; --x) {
            if (!this.isFileValid(files[x])) {
                return false;
            }
        }
        return true;
    }

    protected _acceptFilter(item: File): boolean {
        return acceptType(this.accept, item.type, item.name);
    }

    protected _fileSizeFilter(item: File): boolean {
        return !(this.maxSize && item.size > this.maxSize);
    }

    /** browsers try hard to conceal data about file drags, this tends to undo that */
    filesToWriteableObject(files: File[]): dragMeta[] {
        const jsonFiles: dragMeta[] = [];
        for (let x = 0; x < files.length; ++x) {
            jsonFiles.push({
                type: files[x].type,
                kind: files[x]['kind'],
            });
        }
        return jsonFiles;
    }
}
