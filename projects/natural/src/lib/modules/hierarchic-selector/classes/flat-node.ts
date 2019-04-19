import { HierarchicModelNode } from './model-node';

export class HierarchicFlatNode {

    public loading = false;

    constructor(public node: HierarchicModelNode,
                public name: string,
                public level: number = 0,
                public expandable: boolean = false,
                public selectable: boolean = true,
                public deselectable: boolean = true) {
    }
}
