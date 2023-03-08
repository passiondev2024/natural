// Basic; loosely typed structure for graphql-doctrine filters

import {Literal} from '../../../types/types';

export interface Filter {
    groups?: Array<FilterGroup> | null;
}

export interface FilterGroup {
    // The logic operator to be used to append this group
    groupLogic?: LogicalOperator | null;
    // The logic operator to be used within all conditions in this group
    conditionsLogic?: LogicalOperator | null;
    // Optional joins to either filter the query or fetch related objects from DB in a single query
    joins?: FilterGroupJoin | null;
    // Conditions to be applied on fields
    conditions?: Array<FilterGroupCondition> | null;
}

export interface FilterGroupJoin {
    [key: string]: JoinOn;
}

export interface JoinOn {
    type?: JoinType | null;
    // Optional joins to either filter the query or fetch related objects from DB in a single query
    joins?: FilterGroupJoin | null;
    // Conditions to be applied on fields
    conditions?: Array<FilterGroupCondition> | null;
}

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

export interface FilterGroupCondition {
    [key: string]: FilterGroupConditionField;
}

export interface FilterGroupConditionField {
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
}

export type Scalar = number | string | boolean;

export interface HaveOperator {
    values: Array<string>;
    not?: boolean | null;
}

export interface EmptyOperator {
    not?: boolean | null;
}

export interface BetweenOperator {
    from: Scalar;
    to: Scalar;
    not?: boolean | null;
}

export interface EqualOperator {
    value: Scalar;
    not?: boolean | null;
}

export interface GreaterOperator {
    value: Scalar;
    not?: boolean | null;
}

export interface GreaterOrEqualOperator {
    value: Scalar;
    not?: boolean | null;
}

export interface InOperator {
    values: Array<Scalar>;
    not?: boolean | null;
}

export interface LessOperator {
    value: Scalar;
    not?: boolean | null;
}

export interface LessOrEqualOperator {
    value: Scalar;
    not?: boolean | null;
}

export interface LikeOperator {
    value: Scalar;
    not?: boolean | null;
}

export interface NullOperator {
    not?: boolean | null;
}
