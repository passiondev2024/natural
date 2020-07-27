import {Component, Input} from '@angular/core';

type User =
    | {
          name: string;
          fullName?: string;
      }
    | {
          name?: string;
          fullName: string;
      };

type Stamped = {
    creator: User | null;
    updater: User | null;
    creationDate: string | null;
    updateDate: string | null;
};

@Component({
    selector: 'natural-stamp',
    templateUrl: './stamp.component.html',
})
export class NaturalStampComponent {
    @Input() item!: Stamped;
}
