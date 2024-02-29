// Basic; loosely typed structure for graphql-doctrine filters

import {Literal} from '../../../types/types';

export type Filter = {
    groups?: FilterGroup[] | null;
};

export type FilterGroup = {
    // The logic operator to be used to append this group
    groupLogic?: LogicalOperator | null;
    // The logic operator to be used within all conditions in this group
    conditionsLogic?: LogicalOperator | null;
    // Optional joins to either filter the query or fetch related objects from DB in a single query
    joins?: FilterGroupJoin | null;
    // Conditions to be applied on fields
    conditions?: FilterGroupCondition[] | null;
};

export type FilterGroupJoin = Record<string, JoinOn>;

export type JoinOn = {
    type?: JoinType | null;
    // Optional joins to either filter the query or fetch related objects from DB in a single query
    joins?: FilterGroupJoin | null;
    // Conditions to be applied on fields
    conditions?: FilterGroupCondition[] | null;
};

// Logical operator to be used in conditions
export enum LogicalOperator {
    AND = 'AND',
    OR = 'OR',
}

// Join types to be used in DQL
export enum JoinType {
    innerJoin = 'innerJoin',
    leftJoin = 'leftJoin',
}

export type FilterGroupCondition = Record<string, FilterGroupConditionField>;

export type FilterGroupConditionField = {
    between?: BetweenOperator | null;
    equal?: EqualOperator | null;
    greater?: GreaterOperator | null;
    greaterOrEqual?: GreaterOrEqualOperator | null;
    in?: InOperator | null;
    less?: LessOperator | null;
    lessOrEqual?: LessOrEqualOperator | null;
    like?: LikeOperator | null;
    null?: NullOperator | null;

    // For relations
    have?: HaveOperator | null;
    empty?: EmptyOperator | null;

    // Allow anything else for custom operators
    [key: string]: Literal | undefined | null;
};

export type Scalar = number | string | boolean;

export type HaveOperator = {
    values: string[];
    not?: boolean | null;
};

export type EmptyOperator = {
    not?: boolean | null;
};

export type BetweenOperator = {
    from: Scalar;
    to: Scalar;
    not?: boolean | null;
};

export type EqualOperator = {
    value: Scalar;
    not?: boolean | null;
};

export type GreaterOperator = {
    value: Scalar;
    not?: boolean | null;
};

export type GreaterOrEqualOperator = {
    value: Scalar;
    not?: boolean | null;
};

export type InOperator = {
    values: Scalar[];
    not?: boolean | null;
};

export type LessOperator = {
    value: Scalar;
    not?: boolean | null;
};

export type LessOrEqualOperator = {
    value: Scalar;
    not?: boolean | null;
};

export type LikeOperator = {
    value: Scalar;
    not?: boolean | null;
};

export type NullOperator = {
    not?: boolean | null;
};
