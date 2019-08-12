import { UrlMatchResult, UrlSegment } from '@angular/router';
import { NaturalPanelsService } from './panels.service';

export function NaturalPanelsUrlMatcher(segments: UrlSegment[]): UrlMatchResult {
    return {consumed: NaturalPanelsService.getConsumedSegments(segments)};
}
