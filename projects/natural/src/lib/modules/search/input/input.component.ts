import { PortalInjector } from '@angular/cdk/portal';
import {
    Component,
    ComponentFactoryResolver,
    ComponentRef,
    ElementRef,
    EventEmitter,
    Injector,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges,
    ViewChild,
} from '@angular/core';
import { FormControl, FormGroupDirective, NgForm, ValidationErrors, ValidatorFn } from '@angular/forms';
import { ErrorStateMatcher, MatRipple } from '@angular/material';
import { FilterGroupConditionField } from '../classes/graphql-doctrine.types';
import { getConfigurationFromSelection } from '../classes/utils';
import { ConfigurationSelectorComponent } from '../dropdown-components/configuration-selector/configuration-selector.component';
import { NaturalDropdownRef } from '../dropdown-container/dropdown-ref';
import { NATURAL_DROPDOWN_DATA, NaturalDropdownData, NaturalDropdownService } from '../dropdown-container/dropdown.service';
import { DropdownConfiguration, FlagConfiguration, ItemConfiguration, NaturalSearchConfiguration } from '../types/Configuration';
import { DropdownComponent } from '../types/DropdownComponent';
import { DropdownResult, Selection } from '../types/Values';

// Required to check invalid fields when initializing natural-search
export class AlwaysErrorStateMatcher implements ErrorStateMatcher {
    isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
        return !!control && control.invalid;
    }
}

function isComponentValid(component: DropdownComponent): ValidatorFn {
    return (): ValidationErrors | null => {

        if (!component.isValid()) {
            return {component: true};
        }

        return null;
    };
}

@Component({
    selector: 'natural-input',
    templateUrl: './input.component.html',
    styleUrls: ['./input.component.scss'],
})
export class NaturalInputComponent implements OnInit, OnChanges {

    @Input() placeholder;
    @Input() configurations: NaturalSearchConfiguration;
    @Input() configuration: ItemConfiguration | null;
    @Input() searchFieldName = 'search';
    @Input() selection: Selection | null;
    @Output() selectionChange = new EventEmitter<Selection>();
    @Output() cleared = new EventEmitter<NaturalInputComponent>();

    @ViewChild(MatRipple) ripple: MatRipple;
    @ViewChild('input') input: ElementRef;

    public formCtrl: FormControl = new FormControl();
    private dropdownRef: NaturalDropdownRef | null;

    private dropdownComponentRef: ComponentRef<DropdownComponent>;
    public errorMatcher = new AlwaysErrorStateMatcher();

    private readonly minLength = 5;
    public length = this.minLength;

    constructor(private element: ElementRef,
                private dropdownService: NaturalDropdownService,
                private injector: Injector,
                private componentFactoryResolver: ComponentFactoryResolver) {
    }

    ngOnInit(): void {

        this.input.nativeElement.addEventListener('focus', () => {
            this.openDropdown();
        });

        this.input.nativeElement.addEventListener('keyup', () => {
            if (!this.dropdownRef) {
                return;
            }

            if (this.formCtrl.value !== '') {
                this.dropdownRef.close();
            }
        });

        if (!this.placeholder) {
            this.placeholder = 'Search';
        }

        const placeholderSize = (this.configuration ? this.configuration.display.length : this.placeholder.length) * 0.66;
        this.length = Math.max(this.minLength, Math.ceil(placeholderSize));
    }

    ngOnChanges(changes: SimpleChanges): void {

        if (!this.configurations && this.selection) {
            setTimeout(() => this.clear());

        } else if (this.configurations && this.selection) {

            this.configuration = getConfigurationFromSelection(this.configurations, this.selection);

            // If has configuration, means we need a component from external config
            // If hasn't a configuration, that means we are in global search mode
            if (this.isDropdown()) {
                const dropdownComponent = this.createComponent(this.configuration as DropdownConfiguration);

                this.formCtrl.setValidators([isComponentValid(dropdownComponent)]);
                dropdownComponent.renderedValue.subscribe(value => {
                    this.formCtrl.setValue(value);
                });
            } else if (this.isFlag()) {
                this.formCtrl.setValue('');

            } else if (this.configuration || this.selection.field === this.searchFieldName) {
                if (this.selection && this.selection.condition.like) {
                    this.formCtrl.setValue(this.selection.condition.like.value);
                }

            } else {

                // If component is invalid (no config and not a global search), clear from result and destroy component
                setTimeout(() => this.clear());
            }

        }
    }

    public search(): void {

        if (!this.formCtrl.value) {
            return;
        }

        if (this.isDropdown()) {
            return;
        }

        if (this.formCtrl.valid && this.formCtrl.dirty) {
            this.selectionChange.emit(this.getSelection({like: {value: this.formCtrl.value}}));
        }

    }

    private createComponent(configuration: DropdownConfiguration): DropdownComponent {
        // Always destroy and recreate component
        // Todo : test if configuration has changed, if not re-use the component
        if (this.dropdownComponentRef) {
            this.dropdownComponentRef.destroy();
        }

        const condition = this.selection ? this.selection.condition as FilterGroupConditionField : null;
        const data: NaturalDropdownData = {
            condition: condition,
            configuration: configuration.configuration,
        };

        const injector = new PortalInjector(this.injector, this.createInjectorTokens(data));
        const factory = this.componentFactoryResolver.resolveComponentFactory<DropdownComponent>(configuration.component);
        this.dropdownComponentRef = factory.create(injector);

        return this.dropdownComponentRef.instance;
    }

    private createInjectorTokens(data: NaturalDropdownData): WeakMap<any, NaturalDropdownRef | NaturalDropdownData | null> {

        // Customize injector to allow data and dropdown reference injection in component
        const injectionTokens = new WeakMap<any, NaturalDropdownRef | NaturalDropdownData | null>();
        injectionTokens.set(NaturalDropdownRef, null);
        injectionTokens.set(NATURAL_DROPDOWN_DATA, data);

        return injectionTokens;
    }

    public clear(): void {
        this.configuration = null;
        this.selection = null;
        this.formCtrl.setValue(null);
        this.cleared.emit(this);
    }

    private launchRipple(): void {
        const rippleRef = this.ripple.launch({
            persistent: true,
            centered: true,
        });

        rippleRef.fadeOut();
    }

    public openDropdown(): void {
        if (this.dropdownRef) {
            // Prevent to open multiple dropdowns.
            // Happens as we open on "focus", and alt+tab re-activate focus on an element that already had
            // focus when leaving window with another alt+tab
            return;
        }

        this.launchRipple();

        // If there is no configuration and no string typed, show panel to select the configuration
        if (!this.configuration && !this.formCtrl.value) {
            this.openConfigurationSelectorDropdown();
        } else {
            // If a configuration is selected, open specific component dropdown
            this.openTypeDropdown();
        }
    }

    private openConfigurationSelectorDropdown(): void {

        if (!this.configurations || this.configurations && !this.configurations.length) {
            return;
        }

        const data: NaturalDropdownData = {
            condition: {},
            configuration: {
                configurations: this.configurations,
            },
        };

        const injectorTokens = this.createInjectorTokens(data);
        this.dropdownRef = this.dropdownService.open(ConfigurationSelectorComponent, this.element, injectorTokens);
        this.dropdownRef.closed.subscribe((result: DropdownResult) => {
            this.dropdownRef = null;
            if (result !== undefined) {
                if (result.configuration) {
                    this.setConfiguration(result.configuration);
                } else if (result.condition) {
                    this.setValue(result);
                }
            }
        });

    }

    private openTypeDropdown(): void {

        if (!this.isDropdown()) {
            return;
        }

        const data: NaturalDropdownData = {
            condition: this.selection ? this.selection.condition : null,
            configuration: (this.configuration as DropdownConfiguration).configuration,
        };

        const injectorTokens = this.createInjectorTokens(data);
        const component = (this.configuration as DropdownConfiguration).component;
        this.dropdownRef = this.dropdownService.open(component, this.element, injectorTokens);
        this.dropdownRef.closed.subscribe((result: DropdownResult) => {
            this.dropdownRef = null;
            if (result !== undefined) {
                this.setValue(result);
            }
        });
    }

    public isDropdown(): boolean {
        return !!(this.configuration && (this.configuration as DropdownConfiguration).component);
    }

    public isFlag(): boolean {
        return !!(this.configuration && (this.configuration as FlagConfiguration).condition);
    }

    private setConfiguration(config: ItemConfiguration): void {
        this.configuration = config;

        if (this.isDropdown()) {
            this.openTypeDropdown();

        } else if (this.isFlag()) {
            this.setValue({
                condition: (config as FlagConfiguration).condition,
            });

        } else {
            this.input.nativeElement.focus();
        }
    }

    private setValue(result: DropdownResult): void {
        if (this.configuration) {
            this.selectionChange.emit(this.getSelection(result.condition));
        }
    }

    private getSelection(condition: Selection['condition']) {

        const selection: Selection = {
            field: this.configuration ? this.configuration.field : this.searchFieldName,
            condition: condition,
        };

        if (this.configuration && this.configuration.name) {
            selection.name = this.configuration.name;
        }

        return selection;
    }

}
