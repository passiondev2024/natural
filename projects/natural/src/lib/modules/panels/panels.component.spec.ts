import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {NaturalPanelsComponent} from './panels.component';
import {NaturalPanelsModule} from './panels.module';

describe('PanelComponent', () => {
    let component: NaturalPanelsComponent;
    let fixture: ComponentFixture<NaturalPanelsComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [],
            imports: [RouterTestingModule, NaturalPanelsModule.forRoot({})],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(NaturalPanelsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
