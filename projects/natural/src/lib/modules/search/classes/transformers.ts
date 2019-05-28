import { Selection } from '../types/Values';

/**
 * Wrap the searched value by `%` SQL wildcard
 *
 * So:
 *
 *     {field: 'myFieldName', condition: {like: {value: 'foo'}}}
 *
 * will become
 *
 *     {field: 'myFieldName', condition: {like: {value: '%foo%'}}}
 */
export function wrapLike(selection: Selection): Selection {
    if (selection.condition.like) {
        selection.condition.like.value = '%' + selection.condition.like.value + '%';
    }

    return selection;
}

/**
 * Replace the operator name (usually "like", "in" or "between") with the
 * attribute "field" or "name" defined in the configuration
 *
 * So:
 *
 *     {field: 'myFieldName', condition: {in: {values: [1, 2, 3]}}}
 *
 * will become
 *
 *     {field: 'myFieldName', condition: {myFieldName: {values: [1, 2, 3]}}}
 */
export function replaceOperatorByField(selection: Selection): Selection {
    return replaceOperatorByAttribute(selection, 'field');
}

/**
 * Replace the operator name (usually "like", "in" or "between") with the
 * field "name" defined in the configuration
 *
 * So:
 *
 *     {field: 'myFieldName', name:'myConfigName', condition: {in: {values: [1, 2, 3]}}}
 *
 * will become
 *
 *     {field: 'myFieldName',  name:'myConfigName', condition: {myConfigName: {values: [1, 2, 3]}}}
 */
export function replaceOperatorByName(selection: Selection): Selection {
    return replaceOperatorByAttribute(selection, 'name');
}

function replaceOperatorByAttribute(selection: Selection, attribute: string): Selection {
    const oldOperator = Object.keys(selection.condition)[0];

    selection.condition[selection[attribute]] = selection.condition[oldOperator];
    delete selection.condition[oldOperator];

    return selection;
}
