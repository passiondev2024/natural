import { Literal } from '../../../../types/types';
import { HierarchicConfiguration } from './HierarchicConfiguration';

export interface HierarchicFilterConfiguration<T = Literal> {
    service: HierarchicConfiguration['service'];
    filter: T;
}


export interface HierarchicFiltersConfiguration<T = Literal> extends Array<HierarchicFilterConfiguration<T>> {
}
