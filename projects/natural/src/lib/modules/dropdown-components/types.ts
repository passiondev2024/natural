import { FilterGroupConditionField } from '../search/classes/graphql-doctrine.types';

export type PossibleOperators = {
    [key in keyof FilterGroupConditionField]: string;
};
