// Basic; loosely typed structure for graphql-doctrine filters

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
    between?: BetweenOperator;
    equal?: EqualOperator;
    greater?: GreaterOperator;
    greaterOrEqual?: GreaterOrEqualOperator;
    in?: InOperator;
    less?: LessOperator;
    lessOrEqual?: LessOrEqualOperator;
    like?: LikeOperator;
    null?: NullOperator;

    // For relations
    have?: HaveOperator;
    empty?: EmptyOperator;
}

export type Scalar =
    number
    | string
    | boolean;

export interface HaveOperator {
    values: Array<string>;
    not?: boolean;
}

export interface EmptyOperator {
    not?: boolean;
}

export interface BetweenOperator {
    from: Scalar;
    to: Scalar;
    not?: boolean;
}

export interface EqualOperator {
    value: Scalar;
    not?: boolean;
}

export interface GreaterOperator {
    value: Scalar;
    not?: boolean;
}

export interface GreaterOrEqualOperator {
    value: Scalar;
    not?: boolean;
}

export interface InOperator {
    values: Array<Scalar>;
    not?: boolean;
}

export interface LessOperator {
    value: Scalar;
    not?: boolean;
}

export interface LessOrEqualOperator {
    value: Scalar;
    not?: boolean;
}

export interface LikeOperator {
    value: Scalar;
    not?: boolean;
}

export interface NullOperator {
    not?: boolean;
}

