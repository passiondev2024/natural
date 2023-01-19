import {
    Component,
    EventEmitter,
    HostBinding,
    Inject,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges,
} from '@angular/core';
import {AbstractControl} from '@angular/forms';
import {DomSanitizer, SafeStyle} from '@angular/platform-browser';
import {Observable, of, Subject, tap} from 'rxjs';
import {NaturalFileService} from '../file.service';
import {DOCUMENT} from '@angular/common';
import {FileModel} from '../types';
import {NaturalAlertService} from '../../alert/alert.service';

// @dynamic
@Component({
    selector: 'natural-file',
    templateUrl: './file.component.html',
    styleUrls: ['./file.component.scss'],
})
export class FileComponent implements OnInit, OnChanges {
    @HostBinding('style.height.px') @Input() public height = 250;

    @Input() public action: 'upload' | 'download' | null = null;

    @Input() public backgroundSize = 'contain';

    /**
     * Comma-separated list of unique file type specifiers. Like the native element
     * it can be a mix of mime-type and file extensions.
     *
     * See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#accept
     */
    @Input() public accept = 'image/bmp,image/gif,image/jpeg,image/pjpeg,image/png,image/svg+xml,image/svg,image/webp';

    /**
     * If given it will be called when a new file is selected. The callback should typically upload the file
     * to the server and link the newly uploaded file to the existing related object.
     *
     * The callback **must** be able to run even if the calling component has been destroyed. That means in most
     * cases you **must** `bind()` the callback explicitly, like so:
     *
     * ```html
     * <natural-file [uploader]="myCallback.bind(this)"></natural-file>
     * ```
     *
     * Also, you probably **should** set a `[formCtrl]` so that the form is updated automatically, instead of doing
     * it manually within the callback.
     */
    @Input() public uploader?: (file: File) => Observable<FileModel>;

    @Input() public model: FileModel | null = null;

    /**
     * If provided, its value will get updated when the model changes.
     * But its value is never read, so if you want to set a value use `[model]` instead.
     */
    @Input() public formCtrl: AbstractControl | null | undefined = null;

    /**
     * This **must not** be used to mutate the server, because it is very likely it will never be called if the
     * human navigates away from the page before the upload is finished. Instead, you should use `[uploader]`.
     */
    @Output() public readonly modelChange = new EventEmitter<FileModel>();

    public imagePreview: SafeStyle | null = null;
    public filePreview: string | null = null;

    public constructor(
        private readonly naturalFileService: NaturalFileService,
        private readonly alertService: NaturalAlertService,
        private readonly sanitizer: DomSanitizer,
        @Inject(DOCUMENT) private readonly document: Document,
    ) {}

    public ngOnInit(): void {
        this.updateImage();
    }

    public ngOnChanges(changes: SimpleChanges): void {
        if (changes.model && changes.model.previousValue !== changes.model.currentValue) {
            this.updateImage();
        }
    }

    public upload(file: File): void {
        this.model = {file: file};
        this.updateImage();

        if (this.formCtrl) {
            this.formCtrl.setValue(this.model);
        }

        const observable =
            this.uploader?.(file).pipe(tap(() => this.alertService.info($localize`Mis à jour`))) ?? of(this.model);

        observable.subscribe(result => {
            this.model = result;
            if (this.formCtrl) {
                this.formCtrl.setValue(this.model);
            }

            this.modelChange.emit(this.model);
        });
    }

    public getDownloadLink(): null | string {
        if (this.action !== 'download') {
            return null;
        }

        return this.naturalFileService.getDownloadLink(this.model);
    }

    private updateImage(): void {
        this.imagePreview = null;
        this.filePreview = null;
        if (!this.model) {
            return;
        }

        if (this.model.file?.type.includes('image/')) {
            // Model from upload (before saving)
            this.getBase64(this.model.file).subscribe(result => {
                const content = 'url(data:' + this.model?.file?.type + ';base64,' + result + ')';
                this.imagePreview = this.sanitizer.bypassSecurityTrustStyle(content);
            });
        } else if (this.model.file) {
            this.filePreview = this.model.file.type.split('/')[1];
        } else if (this.model.__typename === 'Image' && this.model.id) {
            // Model image with id, use specific API to render image by size
            const window = this.document.defaultView;
            if (!window) {
                throw new Error('Could not show image preview because `window` is undefined');
            }

            const loc = window.location;
            const height = this.height ? '/' + this.height : '';

            // create image url without port to stay compatible with dev mode
            const image = loc.protocol + '//' + loc.hostname + '/api/image/' + this.model.id + height;
            this.imagePreview = this.sanitizer.bypassSecurityTrustStyle('url(' + image + ')');
        } else if (this.model?.mime && ['File', 'AccountingDocument'].includes(this.model.__typename || '')) {
            this.filePreview = this.model.mime.split('/')[1];
        } else if (this.model.src) {
            // external url
            this.imagePreview = this.sanitizer.bypassSecurityTrustStyle('url(' + this.model.src + ')');
        }
    }

    private getBase64(file: File | null): Observable<string> {
        if (!file) {
            return of('');
        }

        const subject = new Subject<string>();

        const reader = new FileReader();
        reader.addEventListener('load', (ev: any) => {
            subject.next(btoa(ev.target.result));
            subject.complete();
        });
        reader.readAsBinaryString(file);

        return subject.asObservable();
    }
}
