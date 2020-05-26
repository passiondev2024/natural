import {lowerCaseFirstLetter, makePlural, relationsToIds, upperCaseFirstLetter} from '@ecodev/natural';

describe('Utility', () => {
    it('should transform relations to id and remove __typename, but never touch File or Date instances', () => {
        const file = new File(['foo'], 'foo');
        const date = new Date();
        const input = {
            prop1: 'val1',
            obj1: {
                id: 123,
                prop2: 'val2',
            },
            prop3: {
                prop4: 'val4',
            },
            prop5: {
                prop6: 'val6',
                __typename: 'some type',
            },
            array: [{id: 10}, {id: 20}, {foo: 'bar'}],
            file: file,
            date: date,
        };

        const expected = {
            prop1: 'val1',
            obj1: 123,
            prop3: {
                prop4: 'val4',
            },
            prop5: {
                prop6: 'val6',
            },
            array: [10, 20, {foo: 'bar'}],
            file: file,
            date: date,
        };

        const result = relationsToIds(input);
        expect(result).toEqual(expected);

        // The original object must not be touched
        expect(input.prop5.__typename).toBe('some type');
    });

    it('should make plural according to english grammar', () => {
        const result1 = makePlural('action');
        expect(result1).toBe('actions');

        const result2 = makePlural('taxonomy');
        expect(result2).toBe('taxonomies');

        const result3 = makePlural('process');
        expect(result3).toBe('processes');
    });

    it('should uppercase first letter', () => {
        const result = upperCaseFirstLetter('foo bAr');
        expect(result).toBe('Foo bAr');
    });

    it('should lowercase first letter', () => {
        const result = lowerCaseFirstLetter('FOO BaR');
        expect(result).toBe('fOO BaR');
    });
});
