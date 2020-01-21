import { BehaviorSubject } from 'rxjs';
import { NaturalHierarchicConfiguration } from './hierarchic-configuration';

export class HierarchicModelNode {

    public childrenChange: BehaviorSubject<HierarchicModelNode[]> = new BehaviorSubject<HierarchicModelNode[]>([]);

    constructor(public model: any, public config: NaturalHierarchicConfiguration) {
    }

    get children(): HierarchicModelNode[] {
        return this.childrenChange.value;
    }
}
