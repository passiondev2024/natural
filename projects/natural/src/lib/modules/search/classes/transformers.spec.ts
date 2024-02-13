import {
    formatIsoDate,
    replaceOperatorByField,
    replaceOperatorByName,
    wrapLike,
    wrapPrefix,
    wrapSuffix,
} from '@ecodev/natural';
import {NaturalSearchSelection} from '../types/values';
import {replaceToday} from './transformers';

describe('wrapLike', () => {
    it('should add % around like value', () => {
        const input: NaturalSearchSelection = {
            field: 'myFieldName',
            condition: {like: {value: 'foo'}},
        };

        const expected: NaturalSearchSelection = {
            field: 'myFieldName',
            condition: {like: {value: '%foo%'}},
        };

        expect(wrapLike(input)).toEqual(expected);
    });
});

describe('wrapPrefix', () => {
    it('should add % after like value', () => {
        const input: NaturalSearchSelection = {
            field: 'myFieldName',
            condition: {like: {value: 'foo'}},
        };

        const expected: NaturalSearchSelection = {
            field: 'myFieldName',
            condition: {like: {value: 'foo%'}},
        };

        expect(wrapPrefix(input)).toEqual(expected);
    });
});

describe('wrapSuffix', () => {
    it('should add % before like value', () => {
        const input: NaturalSearchSelection = {
            field: 'myFieldName',
            condition: {like: {value: 'foo'}},
        };

        const expected: NaturalSearchSelection = {
            field: 'myFieldName',
            condition: {like: {value: '%foo'}},
        };

        expect(wrapSuffix(input)).toEqual(expected);
    });
});

describe('replaceOperatorByField', () => {
    it('should replace operator by field name', () => {
        const input: NaturalSearchSelection = {
            field: 'myFieldName',
            condition: {in: {values: [1, 2, 3]}},
        };

        const expected: NaturalSearchSelection = {
            field: 'myFieldName',
            condition: {myFieldName: {values: [1, 2, 3]}},
        };

        expect(replaceOperatorByField(input)).toEqual(expected);
    });
});

describe('replaceOperatorByName', () => {
    it('should replace operator by config name', () => {
        const input: NaturalSearchSelection & {name: string} = {
            field: 'myFieldName',
            name: 'myConfigName',
            condition: {in: {values: [1, 2, 3]}},
        };

        const expected: NaturalSearchSelection = {
            field: 'myFieldName',
            name: 'myConfigName',
            condition: {myConfigName: {values: [1, 2, 3]}},
        };

        expect(replaceOperatorByName(input)).toEqual(expected);
    });
});

describe('replaceToday', () => {
    const date = new Date();
    const today = formatIsoDate(date);

    date.setDate(date.getDate() + 1);
    const tomorrow = formatIsoDate(date);

    it('should replace `< "today"` by `< real today`', () => {
        const input: NaturalSearchSelection = {
            field: 'myFieldName',
            condition: {less: {value: 'today'}},
        };

        const expected: NaturalSearchSelection = {
            field: 'myFieldName',
            condition: {less: {value: today}},
        };

        expect(replaceToday(input)).toEqual(expected);
    });

    it('should replace `≤ "today"` by `< real tomorrow` date and change operator', () => {
        const input: NaturalSearchSelection = {
            field: 'myFieldName',
            condition: {lessOrEqual: {value: 'today'}},
        };

        const expected: NaturalSearchSelection = {
            field: 'myFieldName',
            condition: {less: {value: tomorrow}},
        };

        expect(replaceToday(input)).toEqual(expected);
    });

    it('should replace `> "today"` by `≥ real tomorrow` date and change operator', () => {
        const input: NaturalSearchSelection = {
            field: 'myFieldName',
            condition: {greater: {value: 'today'}},
        };

        const expected: NaturalSearchSelection = {
            field: 'myFieldName',
            condition: {greaterOrEqual: {value: tomorrow}},
        };

        expect(replaceToday(input)).toEqual(expected);
    });

    it('should replace "today" and "tomorrow" by real today date everywhere', () => {
        const input: NaturalSearchSelection = {
            field: 'myFieldName',
            condition: {
                greaterOrEqual: {value: 'today'},
                less: {value: 'tomorrow'},
            },
        };

        const expected: NaturalSearchSelection = {
            field: 'myFieldName',
            condition: {
                greaterOrEqual: {value: today},
                less: {value: tomorrow},
            },
        };

        expect(replaceToday(input)).toEqual(expected);
    });
});
