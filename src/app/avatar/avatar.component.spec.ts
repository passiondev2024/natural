import {TestBed, waitForAsync} from '@angular/core/testing';

import {AvatarComponent} from './avatar.component';
import {MaterialModule} from '../material.module';

describe('AppComponent', () => {
    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [AvatarComponent],
                imports: [MaterialModule],
            }).compileComponents();
        }),
    );

    it(
        'should create the app',
        waitForAsync(() => {
            const fixture = TestBed.createComponent(AvatarComponent);
            const app = fixture.debugElement.componentInstance;
            expect(app).toBeTruthy();
        }),
    );
});
