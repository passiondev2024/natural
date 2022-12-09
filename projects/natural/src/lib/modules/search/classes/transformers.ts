import {NaturalSearchSelection} from '../types/values';
import {formatIsoDate} from '../../../classes/utility';

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
export function wrapLike(selection: NaturalSearchSelection): NaturalSearchSelection {
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
export function replaceOperatorByField(selection: NaturalSearchSelection): NaturalSearchSelection {
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
export function replaceOperatorByName(selection: NaturalSearchSelection): NaturalSearchSelection {
    return replaceOperatorByAttribute(selection, 'name');
}

function replaceOperatorByAttribute(
    selection: NaturalSearchSelection,
    attribute: 'name' | 'field',
): NaturalSearchSelection {
    const oldOperator = Object.keys(selection.condition)[0];

    const attributeValue = selection[attribute];
    if (!attributeValue) {
        throw new Error('Attribute cannot be empty. Most likely the configuration was wrong');
    }

    selection.condition[attributeValue] = selection.condition[oldOperator];
    delete selection.condition[oldOperator];

    return selection;
}

/**
 * Replace `"today"` and `"tomorrow"` by their real value right now.
 *
 * This transformer is applied automatically and should **not** be part
 * of Natural public API.
 *
 * So:
 *
 *     {field: 'myFieldName', condition: {greater: {value: 'today'}}}
 *
 * will become
 *
 *     {field: 'myFieldName', condition: {greater: {value: '2023-01-03'}}}
 */
export function replaceToday(selection: NaturalSearchSelection): NaturalSearchSelection {
    const date = new Date();
    const today = formatIsoDate(date);

    date.setDate(date.getDate() + 1);
    const tomorrow = formatIsoDate(date);

    // Transparently adapt exclusive/inclusive ranges for special "today" value.
    // Ideally this should be done in `TypeDateComponent`, like it is done for real date values. But unfortunately I
    // could not find a reasonable way to do that while still being able to reload a coherent GUI without showing
    // "Demain" somewhere in the GUI. And that is something we want to avoid, we only want to show either "Aujourd'hui"
    // or a real date. Otherwise, the human would start thinking with "Demain", and it would then need to be properly
    // supported which over/complexify the code, the GUI and the workflow.
    const condition = selection.condition;
    if (Object.keys(condition).length === 1) {
        if (condition.lessOrEqual?.value === 'today') {
            delete condition.lessOrEqual;
            condition.less = {value: 'tomorrow'};
        } else if (condition.greater?.value === 'today') {
            delete condition.greater;
            condition.greaterOrEqual = {value: 'tomorrow'};
        }
    }

    for (const key in condition) {
        const operator = condition[key];
        if (operator && 'value' in operator) {
            if (operator.value === 'today') {
                operator.value = today;
            } else if (operator.value === 'tomorrow') {
                operator.value = tomorrow;
            }
        }
    }

    return selection;
}
