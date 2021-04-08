import {Subject} from 'rxjs';
import {DropdownComponent} from '../types/dropdown-component';
import {DropdownResult} from '../types/values';
import {NaturalDropdownContainerComponent} from './dropdown-container.component';
import {ComponentPortal, ComponentType} from '@angular/cdk/portal';
import {ComponentRef, Injector, StaticProvider} from '@angular/core';

export class NaturalDropdownRef {
    public readonly componentInstance: DropdownComponent;
    public readonly closed = new Subject<DropdownResult>();

    constructor(
        private readonly dropdownContainer: NaturalDropdownContainerComponent,
        component: ComponentType<DropdownComponent>,
        customProviders: StaticProvider[],
        parentInjector: Injector,
        containerRef: ComponentRef<NaturalDropdownContainerComponent>,
    ) {
        // Customize injector to allow data and dropdown reference injection in component
        customProviders.push({provide: NaturalDropdownRef, useValue: this});
        const customInjector = Injector.create({providers: customProviders, parent: parentInjector});

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
