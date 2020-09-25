import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';

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
    public readonly filesChanged = new Subject<File[]>();
}
