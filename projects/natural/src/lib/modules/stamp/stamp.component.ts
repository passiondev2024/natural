import {Component, Input} from '@angular/core';
import {NameOrFullName} from '../../types/types';
import {NaturalTimeAgoPipe} from '../common/pipes/time-ago.pipe';
import {NaturalSwissDatePipe} from '../common/pipes/swiss-date.pipe';
import {NgIf} from '@angular/common';

type Stamped = {
    creator: NameOrFullName | null;
    updater: NameOrFullName | null;
    creationDate: string | null;
    updateDate: string | null;
};

@Component({
    selector: 'natural-stamp',
    templateUrl: './stamp.component.html',
    standalone: true,
    imports: [NgIf, NaturalSwissDatePipe, NaturalTimeAgoPipe],
})
export class NaturalStampComponent {
    @Input({required: true}) public item!: Stamped;

    public showUpdate(): boolean {
        const same =
            this.item.updater?.id === this.item.creator?.id &&
            this.item.updateDate &&
            this.item.updateDate === this.item.creationDate;

        return !same && (!!this.item.updateDate || !!this.item.updater);
    }
}
