import {FilterGroupConditionField} from '../search/classes/graphql-doctrine.types';

export type PossibleComparableOpertorKeys = keyof Pick<
    FilterGroupConditionField,
    'less' | 'lessOrEqual' | 'equal' | 'greaterOrEqual' | 'greater'
>;

export interface PossibleComparableOperator {
    key: PossibleComparableOpertorKeys;
    label: string;
}

export const possibleComparableOperators: PossibleComparableOperator[] = [
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

export type PossibleDiscreteOperatorKeys = 'is' | 'isnot' | 'any' | 'none';

export interface PossibleDiscreteOperator {
    key: PossibleDiscreteOperatorKeys;
    label: string;
}

export const possibleDiscreteOperators: PossibleDiscreteOperator[] = [
    {
        key: 'is',
        label: $localize`est`,
    },
    {
        key: 'isnot',
        label: $localize`n'est pas`,
    },
    {
        key: 'any',
        label: $localize`avec`,
    },
    {
        key: 'none',
        label: $localize`sans`,
    },
];
