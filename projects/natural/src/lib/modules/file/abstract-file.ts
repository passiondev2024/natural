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
import {
    acceptType,
    createInvisibleFileInputWrap,
    isFileInput,
    detectSwipe,
    fileListToArray,
    eventToFiles,
    stopEvent,
} from './utils';
import {NaturalFileService} from './file.service';

export interface InvalidFile {
    file: File;
    error: string;
}

/**
 * A master base set of logic intended to support file select/drag/drop operations
 * NOTE: Use ngfDrop for full drag/drop. Use ngfSelect for selecting
 */
@Directive()
export abstract class NaturalAbstractFile implements OnInit, OnDestroy, OnChanges {
    private fileElement?: HTMLInputElement;
    private readonly validators = [
        {name: 'accept', fn: this.acceptValidator},
        {name: 'fileSize', fn: this.fileSizeValidator},
    ];

    /**
     * Whether we should accept a single file or multiple files
     */
    @Input() public multiple = false;

    /**
     * Comma-separated list of unique file type specifiers. Like the native element
     * it can be a mixed of mime-type and file extensions.
     */
    @Input() public accept = '';

    /**
     * Maximum file size in bytes. 0 means no validation at all.
     */
    @Input() public maxSize = 0;

    /**
     * Disable the file selection entirely
     */
    @Input() public fileSelectionDisabled = false;

    /**
     * Whether the user can click on the element to select something
     *
     * This has only effect during initialization. Subsequent changes will have
     * no effect.
     */
    @Input() public selectable = false;

    /**
     * The single file that has been selected.
     */
    @Output() public fileChange: EventEmitter<File> = new EventEmitter();

    /**
     * The list of files that have been selected.
     */
    @Output() public filesChange: EventEmitter<File[]> = new EventEmitter<File[]>();

    /**
     * The list of files that have been selected but are invalid according to validators.
     */
    @Output() public invalidFilesChange: EventEmitter<InvalidFile[]> = new EventEmitter();

    constructor(
        private readonly element: ElementRef<HTMLElement>,
        protected readonly naturalFileService: NaturalFileService,
    ) {}

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
            const error = this.validate(file);
            if (error) {
                invalids.push({
                    file: file,
                    error: error,
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
            this.naturalFileService.filesChanged.next(valids);
        }

        this.getFileElement().value = '';
    }

    /**
     * Called when input has files
     */
    private changeFn(event: Event): void {
        if (!(event.target instanceof HTMLInputElement)) {
            return;
        }

        const fileList = event.target.files;

        if (!fileList) {
            return;
        }

        stopEvent(event);
        this.handleFiles(fileListToArray(fileList));
    }

    private clickHandler(event: Event): boolean {
        const elm = this.element.nativeElement;
        if (elm.getAttribute('disabled') || this.fileSelectionDisabled) {
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

    @HostListener('change', ['$event'])
    public onChange(event: Event): void {
        const fileList = this.getFileElement().files;
        const files: File[] = fileList ? fileListToArray(fileList) : eventToFiles(event);

        if (!files.length) {
            return;
        }

        stopEvent(event);
        this.handleFiles(files);
    }

    private validate(file: File): string | null {
        for (const validator of this.validators) {
            if (!validator.fn.call(this, file)) {
                return validator.name;
            }
        }

        return null;
    }

    private acceptValidator(item: File): boolean {
        return acceptType(this.accept, item.type, item.name);
    }

    private fileSizeValidator(item: File): boolean {
        return !(this.maxSize && item.size > this.maxSize);
    }
}
