import {TestBed} from '@angular/core/testing';
import {AvatarComponent} from './avatar.component';
import {testImports} from '../shared/testing/module';

describe('AppComponent', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AvatarComponent],
            imports: [...testImports],
        }).compileComponents();
    });

    it('should create the app', () => {
        const fixture = TestBed.createComponent(AvatarComponent);
        const app = fixture.debugElement.componentInstance;
        expect(app).toBeTruthy();
    });
});
