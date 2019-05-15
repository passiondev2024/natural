import { QueryVariables } from '../../../../classes/query-variable-manager';

export interface HierarchicConfiguration {

    /**
     * An AbstractModelService to be used to fetch items
     */
    service: any;

    /**
     * A list of FilterConditionField name to filter items
     *
     * Those will be used directly to build filter to fetch items, so they must be
     * valid API FilterConditionField names for the given service.
     *
     * Eg: given the QuestionService, possible names would be:
     *
     * - "chapter" to filter by the question's chapter
     * - "parent" to filter by the question's parent question
     */
    parentsFilters?: string[];

    /**
     * A list of FilterConditionField name to declare hierarchy
     *
     * Those must be the `parentsFilters` name, that correspond to this service,
     * of all children services.
     *
     * Eg: given the QuestionService, possible names would be:
     *
     * - "questions" coming from ChapterService
     * - "questions" coming from QuestionService
     */
    childrenFilters?: string[];

    /**
     * Additional filters applied in the query sent by getList function
     */
    filter?: QueryVariables['filter'];

    /**
     * Key of the returned literal container models by config / service
     */
    selectableAtKey?: string;

    /**
     * Displayed icon for items retrieved for that config
     */
    icon?: string;
    injectedService?: any;

    /**
     * Callback function that returns boolean. If true the item is selectable, if false, it's not.
     * If missing, item is selectable.
     */
    isSelectableCallback?: (item: any) => boolean;
}
