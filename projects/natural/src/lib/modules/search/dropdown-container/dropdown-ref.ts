import { Subject } from 'rxjs';
import { NaturalDropdownContainerComponent } from './dropdown-container.component';
import { OverlayRef } from '@angular/cdk/overlay';
import { DropdownResult } from '../types/Values';
import { DropdownComponent } from '../types/DropdownComponent';

export class NaturalDropdownRef {

    public componentInstance: DropdownComponent;
    public readonly closed = new Subject<DropdownResult>();

    constructor(private overlay: OverlayRef, private dropdownContainer: NaturalDropdownContainerComponent) {
        dropdownContainer.closed.subscribe(() => {
            overlay.dispose();
        });
    }

    public close(result?: DropdownResult): void {
        this.closed.next(result);
        this.closed.complete();
        this.dropdownContainer.close();
    }

}
