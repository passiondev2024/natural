import {Component, Input, OnInit, Optional, Self} from '@angular/core';
import {ControlValueAccessor, NgControl} from '@angular/forms';
import {MatSelectChange} from '@angular/material/select';
import {Observable} from 'rxjs';
import {IEnum, NaturalEnumService} from '../../../services/enum.service';
import {AbstractSelect} from '../abstract-select.component';
import {Literal} from '../../../types/types';

@Component({
    selector: 'natural-select-enum',
    templateUrl: './select-enum.component.html',
})
export class NaturalSelectEnumComponent extends AbstractSelect implements OnInit, ControlValueAccessor {
    /**
     * The name of the enum type, eg: `"ActionStatus"`
     */
    @Input() enumName!: string;

    /**
     * If given an extra option is added to select `null` with given label
     */
    @Input() nullLabel?: string;

    /**
     * Functions that receives an enum value and returns whether that value is disabled
     */
    @Input() optionDisabled?: (item: IEnum) => boolean;

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

    public writeValue(value: Literal | null): void {
        if (this.formCtrl) {
            this.formCtrl.setValue(value);
        }
    }

    public propagateValue(event: MatSelectChange): void {
        super.propagateValue(event.value);
    }

    public getDisplayFn(): (item: any) => string {
        return () => '';
    }
}
