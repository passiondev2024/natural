import {FilterGroupConditionField} from '../search/classes/graphql-doctrine.types';

export interface PossibleComparableOperator {
    key: keyof Pick<FilterGroupConditionField, 'less' | 'lessOrEqual' | 'equal' | 'greaterOrEqual' | 'greater'>;
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

export interface PossibleDiscreteOperator {
    key: 'is' | 'isnot' | 'any' | 'none';
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
        label: $localize`tous`,
    },
    {
        key: 'none',
        label: $localize`aucun`,
    },
];
