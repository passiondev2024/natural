import {BehaviorSubject} from 'rxjs';
import {NaturalHierarchicConfiguration} from './hierarchic-configuration';

export class HierarchicModelNode<T = any> {
    public childrenChange: BehaviorSubject<HierarchicModelNode[]> = new BehaviorSubject<HierarchicModelNode[]>([]);

    constructor(public model: T, public config: NaturalHierarchicConfiguration) {}

    get children(): HierarchicModelNode[] {
        return this.childrenChange.value;
    }
}
