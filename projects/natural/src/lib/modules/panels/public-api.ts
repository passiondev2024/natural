/*
 * Public API Surface of natural
 */

export {providePanels} from './panels.module';
export * from './panels.component';
export * from './panels.service';
export {naturalPanelsUrlMatcher} from './panels.urlmatcher';
export {fallbackIfNoOpenedPanels} from './fallback-if-no-opened-panels.urlmatcher';
export * from './abstract-panel';
export * from './types';
