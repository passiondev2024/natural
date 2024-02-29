import {FilterGroupConditionField} from '../search/classes/graphql-doctrine.types';

export type PossibleComparableOpertorKeys = keyof Pick<
    FilterGroupConditionField,
    'less' | 'lessOrEqual' | 'equal' | 'greaterOrEqual' | 'greater'
>;

export type PossibleComparableOperator = {
    key: PossibleComparableOpertorKeys;
    label: string;
};

export const possibleComparableOperators: Readonly<PossibleComparableOperator[]> = [
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
] as const;

export type PossibleDiscreteOperatorKeys = 'is' | 'isnot' | 'any' | 'none';

export type PossibleDiscreteOperator = {
    key: PossibleDiscreteOperatorKeys;
    label: string;
};

export const possibleDiscreteOperators: Readonly<PossibleDiscreteOperator[]> = [
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
] as const;
