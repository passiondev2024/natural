import {Literal} from '../../../types/types';
import {NaturalHierarchicConfiguration} from './hierarchic-configuration';

export interface HierarchicFilterConfiguration<T = Literal> {
    service: NaturalHierarchicConfiguration['service'];
    filter: T;
}

export interface HierarchicFiltersConfiguration<T = Literal> extends Array<HierarchicFilterConfiguration<T>> {}
