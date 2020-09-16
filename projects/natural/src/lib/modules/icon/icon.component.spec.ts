import {waitForAsync, ComponentFixture, TestBed} from '@angular/core/testing';
import {NaturalIconComponent} from './icon.component';
import {NaturalIconModule} from './icon.module';

describe('NaturalIconComponent', () => {
    let component: NaturalIconComponent;
    let fixture: ComponentFixture<NaturalIconComponent>;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [],
                imports: [NaturalIconModule.forRoot({})],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(NaturalIconComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
