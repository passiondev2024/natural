import { UrlMatchResult, UrlSegment } from '@angular/router';
import { NaturalPanelsService } from './panels.service';

export function NaturalPanelsUrlMatcher(segments: UrlSegment[]): UrlMatchResult | null {
    const result = {consumed: NaturalPanelsService.getConsumedSegments(segments)};
    if (result.consumed.length) {
        return result;
    } else {
        return null;
    }
}
