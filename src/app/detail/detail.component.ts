import {Component, OnInit} from '@angular/core';
import {collectErrors, NaturalAbstractDetail} from '@ecodev/natural';
import {ItemService} from '../../../projects/natural/src/lib/testing/item.service';
import {NaturalFixedButtonDetailComponent} from '../../../projects/natural/src/lib/modules/fixed-button-detail/fixed-button-detail.component';
import {NgIf, JsonPipe} from '@angular/common';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NaturalLinkableTabDirective} from '../../../projects/natural/src/lib/modules/common/directives/linkable-tab.directive';
import {MatTabsModule} from '@angular/material/tabs';
import {RouterLink, RouterOutlet} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {NaturalDetailHeaderComponent} from '../../../projects/natural/src/lib/modules/detail-header/detail-header.component';
import {FlexModule} from '@ngbracket/ngx-layout/flex';

@Component({
    selector: 'app-detail',
    templateUrl: './detail.component.html',
    styleUrls: ['./detail.component.scss'],
    standalone: true,
    imports: [
        FlexModule,
        NaturalDetailHeaderComponent,
        MatButtonModule,
        RouterLink,
        MatTabsModule,
        NaturalLinkableTabDirective,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        NgIf,
        NaturalFixedButtonDetailComponent,
        RouterOutlet,
        JsonPipe,
    ],
})
export class DetailComponent extends NaturalAbstractDetail<ItemService> implements OnInit {
    public readonly collectErrors = collectErrors;

    public constructor(service: ItemService) {
        super('detail', service);
    }
}
