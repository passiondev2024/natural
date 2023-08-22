/*
 * Public API Surface of natural
 */

export * from './directives/linkable-tab.directive';
export * from './pipes/capitalize.pipe';
export * from './pipes/ellipsis.pipe';
export * from './pipes/enum.pipe';
export * from './pipes/swiss-date.pipe';
export {NaturalTimeAgoPipe} from './pipes/time-ago.pipe';
export * from './services/memory-storage';
export {NaturalSrcDensityDirective} from './directives/src-density.directive';
export {
    NATURAL_SEO_CONFIG,
    NaturalSeoConfig,
    NaturalSeoService,
    NaturalSeo,
    NaturalSeoBasic,
    NaturalSeoResolve,
    NaturalSeoCallback,
    NaturalSeoResolveData,
} from './services/seo.service';
export {provideSeo} from './services/seo.provider';
