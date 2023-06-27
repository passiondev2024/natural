import {ComponentFixture, TestBed} from '@angular/core/testing';
import {EditorComponent} from './editor.component';
import {naturalProviders} from '@ecodev/natural';

describe('EditorComponent', () => {
    let component: EditorComponent;
    let fixture: ComponentFixture<EditorComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            providers: [naturalProviders],
        }).compileComponents();

        fixture = TestBed.createComponent(EditorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
