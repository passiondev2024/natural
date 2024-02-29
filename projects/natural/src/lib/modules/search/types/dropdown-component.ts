import {BehaviorSubject} from 'rxjs';
import {FilterGroupConditionField} from '../classes/graphql-doctrine.types';

export type DropdownComponent = {
    /**
     * Observable of current value as string
     */
    readonly renderedValue: BehaviorSubject<string>;

    /**
     * Get condition, including rich object types
     */
    getCondition(): FilterGroupConditionField;

    /**
     * Returns true if dropdown value is valid
     */
    isValid(): boolean;

    /**
     * Returns true if the dropdown value has change
     */
    isDirty(): boolean;
};
