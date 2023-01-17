import {UrlMatcher, UrlMatchResult, UrlSegment} from '@angular/router';
import {NaturalPanelsService} from './panels.service';

/**
 * Url fallback matcher to be used instead of `path: '**'` when Panel system
 * is used in the project.
 */
export const fallbackIfNoOpenedPanels: UrlMatcher = (segments: UrlSegment[]): UrlMatchResult | null => {
    if (!NaturalPanelsService.opened) {
        return {consumed: segments};
    }

    return null;
};
