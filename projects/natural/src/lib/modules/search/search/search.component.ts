import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChildren } from '@angular/core';
import { deepClone } from '../classes/utils';
import { NaturalInputComponent } from '../input/input.component';
import { NaturalSearchConfiguration } from '../types/Configuration';
import { NaturalSearchSelections } from '../types/Values';

@Component({
    selector: 'natural-search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.scss'],
})
export class NaturalSearchComponent implements OnChanges {

    @ViewChildren(NaturalInputComponent) inputs: NaturalInputComponent[];

    @Input() placeholder = 'Rechercher';
    @Input() configurations: NaturalSearchConfiguration;
    @Input() multipleGroups: false;

    @Input() set selections(selections: NaturalSearchSelections) {
        this.innerSelections = selections ? deepClone(selections) : [[]];
    }

    @Output() selectionChange = new EventEmitter<NaturalSearchSelections>();

    public innerSelections: NaturalSearchSelections = [[]];

    ngOnChanges(changes: SimpleChanges): void {
        if (!this.configurations) {
            this.configurations = [];
        }
    }

    public updateGroup(groupSelections, groupIndex): void {
        for (let i = 0; i < groupSelections.length; i++) {
            this.innerSelections[groupIndex][i] = groupSelections[i];
        }
        this.innerSelections[groupIndex].length = groupSelections.length;
        this.selectionChange.emit(this.innerSelections);
    }

    public addGroup(): void {
        this.innerSelections.push([]);
        this.selectionChange.emit(this.innerSelections);
    }

    public removeGroup(index: number): void {
        this.innerSelections.splice(index, 1);
        this.selectionChange.emit(this.innerSelections);
    }

    public clear(): void {
        this.innerSelections = [[]];
        this.selectionChange.emit([[]]);
    }
}
