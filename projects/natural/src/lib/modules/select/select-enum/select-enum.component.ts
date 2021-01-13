import {Component, Input, OnInit, Optional, Self} from '@angular/core';
import {ControlValueAccessor, NgControl} from '@angular/forms';
import {Observable} from 'rxjs';
import {IEnum, NaturalEnumService} from '../../../services/enum.service';
import {AbstractSelect} from '../abstract-select.component';

@Component({
    selector: 'natural-select-enum',
    templateUrl: './select-enum.component.html',
})
export class NaturalSelectEnumComponent extends AbstractSelect<IEnum['value']> implements OnInit, ControlValueAccessor {
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

    public items?: Observable<IEnum[]>;

    constructor(
        private readonly enumService: NaturalEnumService,
        @Optional() @Self() public readonly ngControl: NgControl,
    ) {
        super(ngControl);
    }

    public ngOnInit(): void {
        super.ngOnInit();
        this.items = this.enumService.get(this.enumName);
    }

    public writeValue(value: IEnum['value'] | null): void {
        if (this.internalCtrl) {
            this.internalCtrl.setValue(value);
        }
    }

    public getDisplayFn(): (item: IEnum['value'] | null) => string {
        return () => '';
    }
}
