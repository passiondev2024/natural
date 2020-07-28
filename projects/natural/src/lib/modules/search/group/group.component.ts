import {Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {deepClone} from '../classes/utils';
import {NaturalInputComponent} from '../input/input.component';
import {NaturalSearchFacets} from '../types/facet';
import {GroupSelections, NaturalSearchSelection} from '../types/values';

@Component({
    selector: 'natural-group',
    templateUrl: './group.component.html',
    styleUrls: ['./group.component.scss'],
})
export class NaturalGroupComponent {
    @ViewChild('newValueInput') public newValueInput!: NaturalInputComponent;

    @Input() public placeholder!: string;
    @Input() public facets!: NaturalSearchFacets;
    @Output() public selectionChange = new EventEmitter<GroupSelections>();
    public innerSelections: GroupSelections = [];

    @Input() set selections(selection: GroupSelections) {
        this.innerSelections = deepClone(selection);
    }

    public updateInput(selection: NaturalSearchSelection, index: number): void {
        this.innerSelections[index] = selection;
        this.selectionChange.emit(this.innerSelections);
    }

    public addInput(selection: NaturalSearchSelection): void {
        this.newValueInput.clear();
        this.innerSelections.push(selection);
        this.selectionChange.emit(this.innerSelections);
    }

    public removeInput(index: number): void {
        this.innerSelections.splice(index, 1);
        this.selectionChange.emit(this.innerSelections);
    }
}
