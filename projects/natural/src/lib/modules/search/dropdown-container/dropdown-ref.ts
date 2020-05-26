import {Subject} from 'rxjs';
import {DropdownComponent} from '../types/dropdown-component';
import {DropdownResult} from '../types/values';
import {NaturalDropdownContainerComponent} from './dropdown-container.component';

export class NaturalDropdownRef {
    public componentInstance: DropdownComponent;
    public readonly closed = new Subject<DropdownResult>();

    constructor(private dropdownContainer: NaturalDropdownContainerComponent) {}

    public close(result?: DropdownResult): void {
        this.closed.next(result);
        this.closed.complete();
        this.dropdownContainer.close();
    }
}
