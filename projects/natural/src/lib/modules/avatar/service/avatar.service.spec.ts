import {TestBed} from '@angular/core/testing';
import {AvatarService} from './avatar.service';
import {Gravatar} from '../sources/gravatar';

describe('AvatarService', () => {
    let avatarService: AvatarService;

    describe('Avatar service with default configuration', () => {
        beforeEach(() => {
            TestBed.configureTestingModule({
                providers: [AvatarService],
            });

            avatarService = TestBed.inject(AvatarService);
        });

        it('should be created', () => {
            expect(avatarService).toBeTruthy();
        });

        describe('getCreators', () => {
            it('should return an ordered list of sources', () => {
                const creators = avatarService.getCreators();

                expect(creators).toBeTruthy();
            });
        });

        describe('getRandomColor', () => {
            it('should return transparent when the given value is undefined', () => {
                const color = avatarService.getRandomColor('');

                expect(color).toBe('transparent');
            });

            it('should return a random color based on the ascii code of the given value is', () => {
                const color = avatarService.getRandomColor('random name');
                const cssColorRegex = /#([a-f]|[A-F]|[0-9]){3}(([a-f]|[A-F]|[0-9]){3})?\b/;
                expect(color).toMatch(cssColorRegex);
            });

            it('should not return the same color for two different values', () => {
                const color1 = avatarService.getRandomColor('name1');
                const color2 = avatarService.getRandomColor('name2');

                expect(color1).not.toBe(color2);
            });
        });

        it('should be able to tell if a source has failed before', () => {
            const source1 = new Gravatar('source1');
            const source1bis = new Gravatar('source1');
            const source2 = new Gravatar('source2');

            // At first nothing has failed
            expect(avatarService.sourceHasFailedBefore(source1)).toBe(false);
            expect(avatarService.sourceHasFailedBefore(source1bis)).toBe(false);
            expect(avatarService.sourceHasFailedBefore(source2)).toBe(false);

            avatarService.markSourceAsFailed(source1);

            // source1 has failed, and source1bis should also be considered failed so
            // we don't load the same avatar with failure from two component instances.
            // source2 is still not failed, even though it is the same type of avatar
            expect(avatarService.sourceHasFailedBefore(source1)).toBe(true);
            expect(avatarService.sourceHasFailedBefore(source1bis)).toBe(true);
            expect(avatarService.sourceHasFailedBefore(source2)).toBe(false);
        });
    });
});
