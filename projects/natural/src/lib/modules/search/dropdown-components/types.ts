import { FilterGroupConditionField } from '../classes/graphql-doctrine.types';

export type PossibleOperators = {
    [key in keyof FilterGroupConditionField]: string;
};
