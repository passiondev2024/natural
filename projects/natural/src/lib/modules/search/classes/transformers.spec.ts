import { Selection } from '../types/Values';
import { replaceOperatorByField, replaceOperatorByName, wrapLike } from '@ecodev/natural';

describe('wrapLike', () => {
    it('should add % around like value', () => {
        const input: Selection = {
            field: 'myFieldName',
            condition: {like: {value: 'foo'}},
        };

        const expected: Selection = {
            field: 'myFieldName',
            condition: {like: {value: '%foo%'}},
        };

        expect(wrapLike(input)).toEqual(expected);
    });
});

describe('replaceOperatorByField', () => {
    it('should replace operator by field name', () => {
        const input: Selection = {
            field: 'myFieldName',
            condition: {in: {values: [1, 2, 3]}},
        };

        const expected: any = {
            field: 'myFieldName',
            condition: {myFieldName: {values: [1, 2, 3]}},
        };

        expect(replaceOperatorByField(input)).toEqual(expected);
    });
});

describe('replaceOperatorByName', () => {
    it('should replace operator by config name', () => {
        const input: Selection = {
            field: 'myFieldName',
            name: 'myConfigName',
            condition: {in: {values: [1, 2, 3]}},
        };

        const expected: any = {
            field: 'myFieldName',
            name: 'myConfigName',
            condition: {myConfigName: {values: [1, 2, 3]}},
        };

        expect(replaceOperatorByName(input)).toEqual(expected);
    });
});
