import {ComponentFixture, TestBed} from '@angular/core/testing';

import {NaturalEditorComponent} from './editor.component';
import {NaturalEditorModule} from './editor.module';

describe('NaturalEditorComponent', () => {
    let component: NaturalEditorComponent;
    let fixture: ComponentFixture<NaturalEditorComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [NaturalEditorComponent],
            imports: [NaturalEditorModule],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(NaturalEditorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
