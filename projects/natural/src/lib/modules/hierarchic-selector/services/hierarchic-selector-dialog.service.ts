import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { clone } from 'lodash';
import { NaturalHierarchicConfiguration } from '../classes/hierarchic-configuration';
import { NaturalHierarchicSelectorDialogComponent } from '../hierarchic-selector-dialog/hierarchic-selector-dialog.component';
import { OrganizedModelSelection } from './hierarchic-selector.service';

@Injectable()
export class NaturalHierarchicSelectorDialogService {

    constructor(private dialog: MatDialog) {
    }

    public open(config: NaturalHierarchicConfiguration[],
                multiple: boolean,
                selected: OrganizedModelSelection | null = null,
                allowUnselect: boolean = true,
                filters: any = null,
                restoreFocus: boolean = true): MatDialogRef<NaturalHierarchicSelectorDialogComponent, OrganizedModelSelection> {

        return this.dialog.open<NaturalHierarchicSelectorDialogComponent, any, OrganizedModelSelection>(
            NaturalHierarchicSelectorDialogComponent,
            {
                width: '700px',
                restoreFocus: restoreFocus,
                data: {
                    config: config,
                    filters: filters,
                    multiple: multiple,
                    selected: clone(selected), // clone prevent to affect relation in parent context, this modal should be standalone runner
                    allowUnselect: allowUnselect,
                },
            });

    }
}
