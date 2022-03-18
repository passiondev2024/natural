import {ComponentFixture, TestBed} from '@angular/core/testing';

import {AvatarComponent} from './avatar.component';
import {AvatarService} from '../service/avatar.service';
import {By} from '@angular/platform-browser';
import {SimpleChange} from '@angular/core';
import {Gravatar} from '../sources/gravatar';

describe('AvatarComponent', () => {
    let component: AvatarComponent;
    let fixture: ComponentFixture<AvatarComponent>;
    let avatarService: AvatarService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AvatarComponent],
            providers: [],
        }).compileComponents();

        fixture = TestBed.createComponent(AvatarComponent);
        component = fixture.componentInstance;
        avatarService = TestBed.inject(AvatarService);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('AvatarText', () => {
        it('should display the initials of the given value', () => {
            component.initials = 'John Doe';
            component.ngOnChanges({
                initials: new SimpleChange(null, 'John Doe', true),
            });

            fixture.detectChanges();

            const avatarTextEl = fixture.debugElement.query(By.css('.avatar-container > div'));
            expect(avatarTextEl.nativeElement.textContent.trim()).toBe('JD');
        });
    });

    it('should not try again failed sources', () => {
        // Pretend that this avatar already failed before
        avatarService.markSourceAsFailed(new Gravatar('invalid@example.com'));

        component.gravatar = 'invalid@example.com';
        component.initials = 'John Doe';
        component.ngOnChanges({
            gravatar: new SimpleChange(null, 'invalid@example.com', true),
            initials: new SimpleChange(null, 'John Doe', true),
        });

        fixture.detectChanges();

        const avatarTextEl = fixture.debugElement.query(By.css('.avatar-container > div'));
        expect(avatarTextEl.nativeElement.textContent.trim()).toBe('JD');
    });

    describe('AvatarImage', () => {});
});
