import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule, MatIconModule, MatSidenavModule } from '@angular/material';
import { NaturalSidenavContainerComponent } from './sidenav-container/sidenav-container.component';
import { NaturalSidenavContentComponent } from './sidenav-content/sidenav-content.component';
import { NaturalSidenavComponent } from './sidenav/sidenav.component';

@NgModule({
    declarations: [
        NaturalSidenavComponent,
        NaturalSidenavContainerComponent,
        NaturalSidenavContentComponent,
    ],
    imports: [
        CommonModule,
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
