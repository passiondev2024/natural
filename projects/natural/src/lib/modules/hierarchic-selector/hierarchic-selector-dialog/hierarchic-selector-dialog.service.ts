import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { defaults } from 'lodash';
import {
    HierarchicDialogConfig,
    HierarchicDialogResult,
    NaturalHierarchicSelectorDialogComponent,
} from './hierarchic-selector-dialog.component';

@Injectable()
export class NaturalHierarchicSelectorDialogService {

    constructor(private dialog: MatDialog) {
    }

    public open(
        hierarchicConfig: HierarchicDialogConfig,
        dialogConfig?: MatDialogConfig,
    ): MatDialogRef<NaturalHierarchicSelectorDialogComponent, HierarchicDialogResult> {

        const defaultDialogConfig = {
            width: '700px',
            data: hierarchicConfig,
        };

        return this.dialog.open<NaturalHierarchicSelectorDialogComponent, HierarchicDialogConfig, HierarchicDialogResult>(
            NaturalHierarchicSelectorDialogComponent,
            defaults(dialogConfig, defaultDialogConfig),
        );

    }
}
