import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatSidenavModule} from '@angular/material/sidenav';
import {NaturalSidenavContainerComponent} from './sidenav-container/sidenav-container.component';
import {NaturalSidenavContentComponent} from './sidenav-content/sidenav-content.component';
import {NaturalSidenavComponent} from './sidenav/sidenav.component';
import {sessionStorageProvider} from '../common/services/memory-storage';

@NgModule({
    declarations: [NaturalSidenavComponent, NaturalSidenavContainerComponent, NaturalSidenavContentComponent],
    imports: [CommonModule, MatSidenavModule, MatIconModule, MatButtonModule],
    exports: [NaturalSidenavComponent, NaturalSidenavContainerComponent, NaturalSidenavContentComponent],
    providers: [sessionStorageProvider],
})
export class NaturalSidenavModule {}
