import {ComponentFixture, TestBed} from '@angular/core/testing';
import {NaturalFixedButtonDetailComponent} from './fixed-button-detail.component';
import {ActivatedRoute} from '@angular/router';
import {Subject} from 'rxjs';
import {FormGroup} from '@angular/forms';
import {RouterTestingModule} from '@angular/router/testing';

describe('NaturalFixedButtonDetailComponent', () => {
    let component: NaturalFixedButtonDetailComponent;
    let fixture: ComponentFixture<NaturalFixedButtonDetailComponent>;
    let mockedActivatedRoute: {params: Subject<void>};

    beforeEach(async () => {
        mockedActivatedRoute = {
            params: new Subject<void>(),
        };

        await TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            providers: [
                {
                    provide: ActivatedRoute,
                    useValue: mockedActivatedRoute,
                },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(NaturalFixedButtonDetailComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should handle isCreation from creation to non-creation', () => {
        expect(component.isCreation).toBeFalse();

        component.form = new FormGroup({});
        component.model = {};
        fixture.detectChanges();

        expect(component.isCreation).toBeTrue();

        component.model = {id: '123'};
        fixture.detectChanges();

        expect(component.isCreation).withContext('receive ID on same route will stay in creation mode').toBeTrue();

        mockedActivatedRoute.params.next();
        component.model = {id: '456'};
        fixture.detectChanges();

        expect(component.isCreation)
            .withContext('changed route and then receive new object with ID will change to non-creation mode')
            .toBeFalse();
    });

    it('should handle isCreation from non-creation to creation', () => {
        expect(component.isCreation).toBeFalse();

        component.form = new FormGroup({});
        component.model = {id: '1232'};
        fixture.detectChanges();

        expect(component.isCreation).toBeFalse();

        component.model = {};
        fixture.detectChanges();

        // This case should probably never happen in real world use-case
        expect(component.isCreation)
            .withContext('ID disappear on same route will stay in non-creation mode')
            .toBeFalse();

        mockedActivatedRoute.params.next();
        component.model = {};
        fixture.detectChanges();

        expect(component.isCreation)
            .withContext('changed route and then receive new object without ID will change to creation mode')
            .toBeTrue();
    });
});
