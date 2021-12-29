import {Component, OnInit} from '@angular/core';

@Component({
    selector: 'app-editor',
    templateUrl: './editor.component.html',
    styleUrls: ['./editor.component.scss'],
})
export class EditorComponent implements OnInit {
    public htmlString = `<h1>Title</h1>
<p>Nap all day cat dog hate mouse eat string barf pillow no baths hate everything but kitty poochy. Sleep on keyboard toy mouse squeak roll over. Mesmerizing birds. Poop on grasses licks paws destroy couch intently sniff hand. The dog smells bad gnaw the corn cob.</p>
<p>Throw down all the stuff in the kitchen fooled again thinking the dog likes me play riveting piece on synthesizer keyboard chew on cable missing until dinner time. Licks your face milk the cow.</p>
<ul>
    <li>item 1</li>
    <li>item 2</li>
    <li>item 3</li>
</ul>`;

    constructor() {}

    public ngOnInit(): void {}
}
