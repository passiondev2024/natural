import {Component} from '@angular/core';
import {NaturalHierarchicConfiguration} from '@ecodev/natural';
import {ItemService} from '../../../projects/natural/src/lib/testing/item.service';
import {ErrorService} from '../../../projects/natural/src/lib/testing/error.service';
import {AbstractSelect} from '../AbstractSelect';
import {JsonPipe} from '@angular/common';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NaturalSelectHierarchicComponent} from '../../../projects/natural/src/lib/modules/select/select-hierarchic/select-hierarchic.component';
import {MatButtonModule} from '@angular/material/button';
import {FlexModule} from '@ngbracket/ngx-layout/flex';

@Component({
    templateUrl: './select-hierarchic.component.html',
    styleUrls: ['./select-hierarchic.component.scss'],
    standalone: true,
    imports: [
        FlexModule,
        MatButtonModule,
        NaturalSelectHierarchicComponent,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        JsonPipe,
    ],
})
export class SelectHierarchicComponent extends AbstractSelect {
    public hierarchicConfig: NaturalHierarchicConfiguration[] = [
        {
            service: ItemService,
            parentsRelationNames: ['parent'],
            childrenRelationNames: ['parent'],
            selectableAtKey: 'any',
        },
    ];

    public constructor(service: ItemService, errorService: ErrorService) {
        super(service, errorService);
    }
}
