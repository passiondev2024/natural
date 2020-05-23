import { cloneDeep, groupBy, uniq } from 'lodash';
import { LogicalOperator } from '../modules/search/classes/graphql-doctrine.types';
import { Literal } from '../types/types';

export function hasMixedGroupLogic(groups: Literal[]): boolean {

    // Complete lack of definition by fallback on AND operator
    const completedGroups = cloneDeep(groups).map(group => {

        if (!group.groupLogic) {
            group.groupLogic = LogicalOperator.AND;
        }

        return group;
    });

    const groupLogics = uniq(Object.keys(groupBy(completedGroups.slice(1), 'groupLogic')));

    return groupLogics.length > 1;
}
