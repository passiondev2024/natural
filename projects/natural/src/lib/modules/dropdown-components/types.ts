import {FilterGroupConditionField} from '../search/classes/graphql-doctrine.types';

export interface PossibleOperator {
    key: keyof FilterGroupConditionField & ('less' | 'lessOrEqual' | 'equal' | 'greaterOrEqual' | 'greater');
    label: string;
}

export const possibleOperators: PossibleOperator[] = [
    {
        key: 'less',
        label: '<',
    },
    {
        key: 'lessOrEqual',
        label: '≤',
    },
    {
        key: 'equal',
        label: '=',
    },
    {
        key: 'greaterOrEqual',
        label: '≥',
    },
    {
        key: 'greater',
        label: '>',
    },
];
