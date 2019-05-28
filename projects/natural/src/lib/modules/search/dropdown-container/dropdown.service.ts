import { FlexibleConnectedPositionStrategy, Overlay, OverlayConfig } from '@angular/cdk/overlay';
import { ComponentPortal, PortalInjector } from '@angular/cdk/portal';
import { ComponentRef, ElementRef, Injectable, InjectionToken, Injector } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { FilterGroupConditionField } from '../classes/graphql-doctrine.types';
import {
    NATURAL_DROPDOWN_CONTAINER_DATA,
    NaturalDropdownContainerComponent,
    NaturalDropdownContainerData,
} from './dropdown-container.component';
import { NaturalDropdownRef } from './dropdown-ref';

export interface NaturalDropdownData<C = any> {
    condition: FilterGroupConditionField | null;
    configuration: C;
}

export const NATURAL_DROPDOWN_DATA = new InjectionToken<NaturalDropdownData>('NaturalDropdownData');

@Injectable({
    providedIn: 'root',
})
export class NaturalDropdownService {

    constructor(private overlay: Overlay, private injector: Injector) {
    }

    public open(
        component,
        connectedElement: ElementRef,
        customInjectorTokens: WeakMap<any, NaturalDropdownRef | NaturalDropdownData | null>,
        showValidateButton: boolean,
    ): NaturalDropdownRef {

        // Container data
        const injectionTokens = new WeakMap<any, NaturalDropdownContainerData>();
        const containerData = {showValidateButton: showValidateButton};
        injectionTokens.set(NATURAL_DROPDOWN_CONTAINER_DATA, containerData);
        const containerInjector = new PortalInjector(this.injector, injectionTokens);

        // Container
        const overlayRef = this.overlay.create(this.getOverlayConfig(connectedElement));
        const containerPortal = new ComponentPortal(NaturalDropdownContainerComponent, undefined, containerInjector);
        const containerRef: ComponentRef<NaturalDropdownContainerComponent> = overlayRef.attach(containerPortal);

        const dropdownContainer = containerRef.instance;
        const dropdownRef = new NaturalDropdownRef(dropdownContainer);

        // Customize injector to allow data and dropdown reference injection in component
        customInjectorTokens.set(NaturalDropdownRef, dropdownRef);
        const injector = new PortalInjector(this.injector, customInjectorTokens);

        // Content (type component given in configuration)
        const componentPortal = new ComponentPortal(component, undefined, injector);
        const contentRef = containerRef.instance.attachComponentPortal<any>(componentPortal);
        dropdownRef.componentInstance = contentRef.instance;

        // Start animation that shows menu
        dropdownContainer.startAnimation();

        const close = () => {
            if (dropdownRef.componentInstance.isValid() && dropdownRef.componentInstance.isDirty()) {
                dropdownRef.close({
                    condition: dropdownRef.componentInstance.getCondition(),
                });
            } else {
                dropdownRef.close();
            }
        };

        // When parent closes, remove overlay from dom and update "return" valu
        dropdownContainer.closed.subscribe(() => {
            overlayRef.dispose();
            close();
        });

        // When click on backdrop, validate result.. ?
        overlayRef.backdropClick().pipe(takeUntil(dropdownContainer.closed)).subscribe(() => dropdownContainer.close());

        return dropdownRef;
    }

    /**
     * This method builds the configuration object needed to create the overlay, the OverlayState.
     */
    private getOverlayConfig(element): OverlayConfig {
        return new OverlayConfig({
            positionStrategy: this.getPosition(element),
            hasBackdrop: true,
            backdropClass: 'cdk-overlay-transparent-backdrop',
        });
    }

    private getPosition(element): FlexibleConnectedPositionStrategy {

        return this.overlay.position()
            .flexibleConnectedTo(element)
            .withFlexibleDimensions(true)
            .withViewportMargin(30)
            .withPush(false)
            .withPositions([
                {
                    originX: 'start',
                    originY: 'bottom',
                    overlayX: 'start',
                    overlayY: 'top',
                    offsetY: 10,
                },
            ]);
    }

}
