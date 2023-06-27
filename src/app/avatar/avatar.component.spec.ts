import {TestBed} from '@angular/core/testing';
import {AvatarComponent} from './avatar.component';

describe('AppComponent', () => {
    it('should create the app', () => {
        const fixture = TestBed.createComponent(AvatarComponent);
        const app = fixture.debugElement.componentInstance;
        expect(app).toBeTruthy();
    });
});
