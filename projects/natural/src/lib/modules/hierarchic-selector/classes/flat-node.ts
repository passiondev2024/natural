import {HierarchicModelNode} from './model-node';

export class HierarchicFlatNode {
    public loading = false;

    public constructor(
        public readonly node: HierarchicModelNode,
        public readonly name: string,
        public readonly level: number = 0,
        public expandable: boolean = false,
        public readonly selectable: boolean = true,
        public deselectable: boolean = true,
    ) {}
}
