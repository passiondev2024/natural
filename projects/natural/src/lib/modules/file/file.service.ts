import {Inject, Injectable} from '@angular/core';
import {Subject} from 'rxjs';
import {FileSelection} from './abstract-file';
import {FileModel} from './types';
import {DOCUMENT} from '@angular/common';

@Injectable({
    providedIn: 'root',
})
export class NaturalFileService {
    /**
     * Allow to subscribe to selected files in the entire application. So a
     * child component is able to receive a file that was dropped on a parent
     * component.
     *
     * Typically useful to drop a file on the entire screen, instead of a precise
     * component.
     */
    public readonly filesChanged = new Subject<FileSelection>();

    constructor(@Inject(DOCUMENT) private readonly document: Document) {}

    public getDownloadLink(model: FileModel | null): null | string {
        const window = this.document.defaultView;
        if (!window) {
            throw new Error('Cannot build download link because `window` is undefined');
        }

        const hostname = window.location.protocol + '//' + window.location.hostname;

        if (model?.__typename === 'File') {
            return hostname + '/file/' + model.id;
        } else if (model?.__typename === 'AccountingDocument') {
            return hostname + '/accounting-document/' + model.id;
        } else if (model?.__typename === 'Image') {
            return hostname + '/image/' + model.id;
        }

        return null;
    }
}
