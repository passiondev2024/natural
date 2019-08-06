import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { NaturalSearchFacets } from '../types/facet';
import { GroupSelections, NaturalSearchSelection } from '../types/values';
import { NaturalInputComponent } from '../input/input.component';
import { deepClone } from '../classes/utils';
import { CdkPortalOutlet } from '@angular/cdk/portal';

@Component({
    selector: 'natural-group',
    templateUrl: './group.component.html',
    styleUrls: ['./group.component.scss'],
})
export class NaturalGroupComponent {

    @ViewChild('newValueInput', {static: false}) newValueInput: NaturalInputComponent;

    @Input() placeholder;
    @Input() facets: NaturalSearchFacets;
    @Output() selectionChange = new EventEmitter<GroupSelections>();

    @Input() set selections(selection: GroupSelections) {
        this.innerSelections = deepClone(selection);
    }

    public innerSelections: GroupSelections = [];

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
