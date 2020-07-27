import {BehaviorSubject} from 'rxjs';
import {NaturalHierarchicConfiguration} from './hierarchic-configuration';

export type HierarchicModel = {id: string; __typename: string};

export class HierarchicModelNode {
    public childrenChange: BehaviorSubject<HierarchicModelNode[]> = new BehaviorSubject<HierarchicModelNode[]>([]);

    constructor(public model: HierarchicModel, public config: NaturalHierarchicConfiguration) {}

    get children(): HierarchicModelNode[] {
        return this.childrenChange.value;
    }
}
