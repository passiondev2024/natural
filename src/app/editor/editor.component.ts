import {Component} from '@angular/core';
import {Observable} from 'rxjs';

@Component({
    selector: 'app-editor',
    templateUrl: './editor.component.html',
    styleUrls: ['./editor.component.scss'],
})
export class EditorComponent {
    public htmlStringBasic = `<h1>Basic</h1>
<p>Nap all day cat dog hate mouse eat string barf pillow no baths hate everything but kitty poochy. Sleep on keyboard toy mouse squeak roll over. Mesmerizing birds. Poop on grasses licks paws destroy couch intently sniff hand. The dog smells bad gnaw the corn cob.</p>
<blockquote><p>Throw down all the stuff in the kitchen fooled again thinking the dog likes me play riveting piece on synthesizer keyboard chew on cable missing until dinner time. Licks your face milk the cow.</p></blockquote>
<ul>
    <li>item 1</li>
    <li>item 2</li>
    <li>item 3</li>
</ul>`;

    public htmlStringAdvanced = `<h1>Advanced</h1>
<table class="my-table-class" id="myTable">
  <tr><th colspan="3" data-colwidth="100,0,0">Wide header</th></tr>
  <tr><td>One</td><td>Two</td><td>Three</td></tr>
  <tr><td>Four</td><td>Five</td><td>Six</td></tr>
</table>
<p class="my-paragraph-class">This text should be red when viewport is larger than 900px. Nap all day cat dog hate mouse eat string barf pillow no baths hate everything but kitty poochy. Sleep on keyboard toy mouse squeak roll over. Mesmerizing birds. Poop on grasses licks paws destroy couch intently sniff hand.</p>
<p style="text-align: right">qweqweqwe qwe qw eq  eqw </p>
<blockquote><p>Throw down all the stuff in the kitchen fooled again thinking the dog likes me play riveting piece on synthesizer keyboard chew on cable missing until dinner time. Licks your face milk the cow.</p></blockquote>
<ul>
    <li>item 1</li>
    <li>item 2</li>
    <li>item 3</li>
</ul>
<h2 class="my-title-class" id="chapter2">Title Level2 green italic</h2>
`;

    public readonly css = `
    .my-paragraph-class {background: pink}
    .my-table-class tr:nth-child(even) {background: darkgreen}
    .my-title-class {color: green}
    #chapter2 {font-style: italic}
    #myTable tr th {color: #2a7ae2}
    @media screen and (min-width: 900px) {
       .my-paragraph-class {color: red}
    }
    `;

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

    public update(): void {
        console.log('Save button was clicked');
    }
}
