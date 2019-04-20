import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule, MatIconModule, MatSidenavModule } from '@angular/material';
import { NaturalSidenavComponent } from './sidenav/sidenav.component';
import { NaturalSidenavContainerComponent } from './sidenav-container/sidenav-container.component';
import { NaturalSidenavContentComponent } from './sidenav-content/sidenav-content.component';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
    declarations: [
        NaturalSidenavComponent,
        NaturalSidenavContainerComponent,
        NaturalSidenavContentComponent,
    ],
    imports: [
        CommonModule,
        FlexLayoutModule,
        MatSidenavModule,
        MatIconModule,
        MatButtonModule,
    ],
    exports: [
        NaturalSidenavComponent,
        NaturalSidenavContainerComponent,
        NaturalSidenavContentComponent,
    ],

})
export class NaturalSidenavModule {
}
