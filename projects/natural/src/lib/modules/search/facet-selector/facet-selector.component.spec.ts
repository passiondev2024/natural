import {ComponentFixture, TestBed} from '@angular/core/testing';
import {NaturalDropdownRef} from '../../search/dropdown-container/dropdown-ref';
import {NATURAL_DROPDOWN_DATA, NaturalDropdownData} from '../../search/dropdown-container/dropdown.service';
import {FacetSelectorComponent} from './facet-selector.component';

describe('FacetSelectorComponent', () => {
    let component: FacetSelectorComponent;
    let fixture: ComponentFixture<FacetSelectorComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            providers: [
                {
                    provide: NATURAL_DROPDOWN_DATA,
                    useValue: {
                        condition: {},
                        configuration: {
                            configurations: [],
                        },
                    } satisfies NaturalDropdownData,
                },
                {
                    provide: NaturalDropdownRef,
                    useValue: {},
                },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(FacetSelectorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
