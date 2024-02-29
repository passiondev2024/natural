import {Literal} from '../../../types/types';
import {NaturalHierarchicConfiguration} from './hierarchic-configuration';

export type HierarchicFilterConfiguration<T = Literal> = {
    service: NaturalHierarchicConfiguration['service'];
    filter: T;
};

export type HierarchicFiltersConfiguration<T = Literal> = HierarchicFilterConfiguration<T>[];
