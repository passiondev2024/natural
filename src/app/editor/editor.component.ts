import {Component} from '@angular/core';
import {Observable} from 'rxjs';

@Component({
    selector: 'app-editor',
    templateUrl: './editor.component.html',
    styleUrls: ['./editor.component.scss'],
})
export class EditorComponent {
    public htmlStringBasic = `<h1>Title</h1>
<p>Nap all day cat dog hate mouse eat string barf pillow no baths hate everything but kitty poochy. Sleep on keyboard toy mouse squeak roll over. Mesmerizing birds. Poop on grasses licks paws destroy couch intently sniff hand. The dog smells bad gnaw the corn cob.</p>
<blockquote><p>Throw down all the stuff in the kitchen fooled again thinking the dog likes me play riveting piece on synthesizer keyboard chew on cable missing until dinner time. Licks your face milk the cow.</p></blockquote>
<ul>
    <li>item 1</li>
    <li>item 2</li>
    <li>item 3</li>
</ul>`;
    public htmlStringAdvanced = `<h1>Title</h1>
<p>Nap all day cat dog hate mouse eat string barf pillow no baths hate everything but kitty poochy. Sleep on keyboard toy mouse squeak roll over. Mesmerizing birds. Poop on grasses licks paws destroy couch intently sniff hand. The dog smells bad gnaw the corn cob.</p>
<blockquote><p>Throw down all the stuff in the kitchen fooled again thinking the dog likes me play riveting piece on synthesizer keyboard chew on cable missing until dinner time. Licks your face milk the cow.</p></blockquote>
<ul>
    <li>item 1</li>
    <li>item 2</li>
    <li>item 3</li>
</ul>`;

    constructor() {}

    /**
     * This is just a dummy that loads the file and creates a data URL.
     * You should swap it out with a function that does an actual upload
     * and returns a regular URL for the uploaded file.
     */
    public uploader(file: File): Observable<string> {
        return new Observable<string>(observer => {
            const reader = new FileReader();
            reader.onload = () => {
                observer.next(reader.result as string);
                observer.complete();
            };
            reader.onerror = () => observer.error(reader.error);

            // Some extra delay to make the asynchronicity visible
            const timeout = setTimeout(() => reader.readAsDataURL(file), 1500);

            return () => {
                clearTimeout(timeout);
            };
        });
    }
}
