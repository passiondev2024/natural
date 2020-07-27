import {Subject} from 'rxjs';
import {DropdownComponent} from '../types/dropdown-component';
import {DropdownResult} from '../types/values';
import {NaturalDropdownContainerComponent} from './dropdown-container.component';
import {ComponentPortal, PortalInjector} from '@angular/cdk/portal';
import {ComponentType} from '@angular/cdk/portal/portal';
import {NaturalDropdownData} from './dropdown.service';
import {ComponentRef, Injector} from '@angular/core';

export class NaturalDropdownRef {
    public readonly componentInstance: DropdownComponent;
    public readonly closed = new Subject<DropdownResult>();

    constructor(
        private dropdownContainer: NaturalDropdownContainerComponent,
        component: ComponentType<DropdownComponent>,
        customInjectorTokens: WeakMap<any, NaturalDropdownRef | NaturalDropdownData | null>,
        parentInjector: Injector,
        containerRef: ComponentRef<NaturalDropdownContainerComponent>,
    ) {
        // Customize injector to allow data and dropdown reference injection in component
        customInjectorTokens.set(NaturalDropdownRef, this);
        const customInjector = new PortalInjector(parentInjector, customInjectorTokens);

        // Content (type component given in configuration)
        const componentPortal = new ComponentPortal(component, undefined, customInjector);
        const contentRef = containerRef.instance.attachComponentPortal(componentPortal);

        this.componentInstance = contentRef.instance;
    }

    public close(result?: DropdownResult): void {
        this.closed.next(result);
        this.closed.complete();
        this.dropdownContainer.close();
    }
}
