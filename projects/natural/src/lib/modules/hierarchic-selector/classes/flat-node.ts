import {HierarchicModelNode} from './model-node';

export class HierarchicFlatNode {
    public loading = false;

    public constructor(
        public readonly node: HierarchicModelNode,
        public readonly name: string,
        public readonly level = 0,
        public expandable = false,
        public readonly selectable = true,
        public deselectable = true,
    ) {}
}
