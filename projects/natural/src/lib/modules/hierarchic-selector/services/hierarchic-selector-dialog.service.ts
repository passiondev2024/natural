import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { NaturalHierarchicSelectorDialogComponent } from '../hierarchic-selector-dialog/hierarchic-selector-dialog.component';
import { clone } from 'lodash';
import { OrganizedModelSelection } from './hierarchic-selector.service';
import { NaturalHierarchicConfiguration } from '../classes/hierarchic-configuration';

@Injectable()
export class NaturalHierarchicSelectorDialogService {

    constructor(private dialog: MatDialog) {
    }

    public open(config: NaturalHierarchicConfiguration[],
                multiple: boolean,
                selected: OrganizedModelSelection | null = null,
                allowUnselect: boolean = true,
                filters: any = null): MatDialogRef<NaturalHierarchicSelectorDialogComponent, OrganizedModelSelection> {

        return this.dialog.open<NaturalHierarchicSelectorDialogComponent, any, OrganizedModelSelection>(
            NaturalHierarchicSelectorDialogComponent,
            {
                width: '700px',
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
