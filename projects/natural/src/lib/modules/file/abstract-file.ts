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
    Inject,
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
import {NaturalAbstractController} from '../../classes/abstract-controller';
import {DOCUMENT} from '@angular/common';

export interface InvalidFile {
    file: File;
    error: string;
}

export interface FileSelection {
    /**
     * The list of files that have been selected.
     */
    valid: File[];

    /**
     * The list of files that have been selected but are invalid according to validators.
     */
    invalid: InvalidFile[];
}

/**
 * A master base set of logic intended to support file select/drag/drop operations
 *
 * In most cases you probably want click-to-select and drag-to-select, so you should use:
 *
 *     <div naturalFileDrop [selectable]="true"></div>
 *
 */
@Directive()
export abstract class NaturalAbstractFile extends NaturalAbstractController implements OnInit, OnDestroy, OnChanges {
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
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#accept
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
     * The single valid file that has been selected.
     *
     * It is for convenience of use, and will only emit if there is at least one
     * valid file. See `filesChange` for a more complete output.
     */
    @Output() public readonly fileChange = new EventEmitter<File>();

    /**
     * The list of files that have been selected.
     */
    @Output() public readonly filesChange = new EventEmitter<FileSelection>();

    constructor(
        private readonly element: ElementRef<HTMLElement>,
        protected readonly naturalFileService: NaturalFileService,
        @Inject(DOCUMENT) private readonly document: Document,
    ) {
        super();
    }

    public ngOnDestroy(): void {
        super.ngOnDestroy();
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
        const label = createInvisibleFileInputWrap(this.document);
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
        const selection: FileSelection = {
            valid: [],
            invalid: [],
        };

        for (const file of files) {
            const error = this.validate(file);
            if (error) {
                selection.invalid.push({
                    file: file,
                    error: error,
                });
            } else {
                selection.valid.push(file);
            }
        }

        if (selection.valid.length) {
            this.fileChange.emit(selection.valid[0]);
        }

        if (selection.valid.length || selection.invalid.length) {
            this.filesChange.emit(selection);
            this.naturalFileService.filesChanged.next(selection);
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
