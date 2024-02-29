import {ComponentFixture, TestBed} from '@angular/core/testing';
import {NaturalAvatarComponent} from './avatar.component';
import {AvatarService} from '../service/avatar.service';
import {By} from '@angular/platform-browser';
import {SimpleChange} from '@angular/core';
import {Gravatar} from '../sources/gravatar';

describe('NaturalAvatarComponent', () => {
    let component: NaturalAvatarComponent;
    let fixture: ComponentFixture<NaturalAvatarComponent>;
    let avatarService: AvatarService;

    beforeEach(() => {
        fixture = TestBed.createComponent(NaturalAvatarComponent);
        component = fixture.componentInstance;
        avatarService = TestBed.inject(AvatarService);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should display the initials of the given value', () => {
        component.initials = 'John Doe';
        component.ngOnChanges({
            initials: new SimpleChange(null, component.initials, true),
        });

        fixture.detectChanges();

        const avatarTextEl = fixture.debugElement.query(By.css('.avatar-container > div'));
        expect(avatarTextEl.nativeElement.textContent.trim()).toBe('JD');
    });

    it('should display nothing at all if image fails, and initials is empty', () => {
        component.image = 'https://totaly-non-existing-domain-with-404-image.com/impossible.jpg';
        component.initials = '';
        component.ngOnChanges({
            image: new SimpleChange(null, component.image, true),
            initials: new SimpleChange(null, component.initials, true),
        });

        // Simulate the image failing to load, because in our test the image will never
        // attempt to load because of the `loading="lazy"` attribute
        component.tryNextSource();

        fixture.detectChanges();

        const avatarTextEl = fixture.debugElement.query(By.css('.avatar-container'));
        expect(avatarTextEl.nativeElement.innerHTML.replace(/<!--.*?-->/gs, '')).toBe('');
    });

    it('should not try again failed sources', () => {
        // Pretend that this avatar already failed before
        avatarService.markSourceAsFailed(new Gravatar('invalid@example.com'));

        component.gravatar = 'invalid@example.com';
        component.initials = 'John Doe';
        component.ngOnChanges({
            gravatar: new SimpleChange(null, component.gravatar, true),
            initials: new SimpleChange(null, component.initials, true),
        });

        fixture.detectChanges();

        const avatarTextEl = fixture.debugElement.query(By.css('.avatar-container > div'));
        expect(avatarTextEl.nativeElement.textContent.trim()).toBe('JD');
    });
});
