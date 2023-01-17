import {Component, Input, OnInit, Optional, Self} from '@angular/core';
import {ControlValueAccessor, NgControl} from '@angular/forms';
import {Observable} from 'rxjs';
import {IEnum, NaturalEnumService} from '../../../services/enum.service';
import {AbstractSelect} from '../abstract-select.component';

type V = IEnum['value'] | IEnum['value'][];

@Component({
    selector: 'natural-select-enum',
    templateUrl: './select-enum.component.html',
    styleUrls: ['./select-enum.component.scss'],
})
export class NaturalSelectEnumComponent extends AbstractSelect<V, V> implements OnInit, ControlValueAccessor {
    /**
     * The name of the enum type, eg: `"ActionStatus"`
     */
    @Input() public enumName!: string;

    /**
     * If given an extra option is added to select `null` with given label
     */
    @Input() public nullLabel?: string;

    /**
     * Functions that receives an enum value and returns whether that value is disabled
     */
    @Input() public optionDisabled?: (item: IEnum) => boolean;

    /**
     * Whether the user should be allowed to select multiple options
     */
    @Input() public multiple = false;

    public items?: Observable<IEnum[]>;

    public constructor(
        private readonly enumService: NaturalEnumService,
        @Optional() @Self() public readonly ngControl: NgControl | null,
    ) {
        super(ngControl);
    }

    public ngOnInit(): void {
        super.ngOnInit();
        this.items = this.enumService.get(this.enumName);
    }

    public getDisplayFn(): (item: V | null) => string {
        throw new Error('This should never be called');
    }
}
