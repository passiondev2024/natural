import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';

@Component({
    selector: 'app-other',
    templateUrl: './other.component.html',
    styleUrls: ['./other.component.scss'],
})
export class OtherComponent implements OnInit {
    /**
     * Single control
     */
    public httpPrefixControl = new FormControl('', [Validators.required]);

    /**
     * Form group
     */
    public httpPrefixGroup = new FormGroup({
        prefix: new FormControl('', [Validators.required]),
    });

    public constructor() {}

    public ngOnInit(): void {
        this.httpPrefixControl.valueChanges.subscribe(value => {
            console.log('httpPrefixControl.valueChanges', value);
        });
        this.httpPrefixGroup.valueChanges.subscribe(value => {
            console.log('httpPrefixGroup.valueChanges', value);
        });
    }

    public error(): void {
        throw Error("I'm a natural error");
    }
}
