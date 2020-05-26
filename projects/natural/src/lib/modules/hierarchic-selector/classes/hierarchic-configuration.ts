import {Type} from '@angular/core';
import {QueryVariables} from '../../../classes/query-variable-manager';
import {NaturalAbstractModelService} from '../../../services/abstract-model.service';

type GenericModelService = NaturalAbstractModelService<any, any, any, any, any, any, any, any, any>;

export interface NaturalHierarchicConfiguration<T extends GenericModelService = GenericModelService> {
    /**
     * An AbstractModelService to be used to fetch items
     */
    service: Type<T>;

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
    parentsRelationNames?: string[];

    /**
     * A list of FilterConditionField name to declare hierarchy
     *
     * Those must be the `parentsRelationNames` name, that correspond to this service,
     * of all children services.
     *
     * Eg: given the QuestionService, possible names would be:
     *
     * - "questions" coming from ChapterService
     * - "questions" coming from QuestionService
     */
    childrenRelationNames?: string[];

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
    injectedService?: T;

    /**
     * Callback function that returns boolean. If true the item is selectable, if false, it's not.
     * If missing, item is selectable.
     */
    isSelectableCallback?: (item: any) => boolean;

    /**
     * Functions that receives a model and returns a string for display value
     *
     * If missing, fallback on global `NaturalHierarchicSelectorComponent.displayWith`
     */
    displayWith?: (item: any) => string;
}

export interface NaturalHierarchicServiceConfiguration<T extends GenericModelService = GenericModelService>
    extends NaturalHierarchicConfiguration<T> {
    injectedService: T;
}
