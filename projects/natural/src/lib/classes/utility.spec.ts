import {
    formatIsoDate,
    formatIsoDateTime,
    lowerCaseFirstLetter,
    makePlural,
    relationsToIds,
    SortingOrder,
    upperCaseFirstLetter,
    validateColumns,
    validatePagination,
    validateSorting,
} from '@ecodev/natural';

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
            objWithNullId: {
                id: null,
                prop2: 'val2',
            },
            emptyString: '',
            zero: 0,
            false: false,
            objWhichIsNull: null,
            objWhichIsUndefined: undefined,
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
            objWithNullId: {
                id: null,
                prop2: 'val2',
            },
            emptyString: '',
            zero: 0,
            false: false,
            objWhichIsNull: null,
            objWhichIsUndefined: undefined,
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

    it('should format date without time', () => {
        expect(formatIsoDate(new Date('2021-09-23T17:57:16+09:00'))).toBe('2021-09-23');
        expect(formatIsoDate(new Date('2021-01-01'))).toBe('2021-01-01');
    });

    it('should format date without time', () => {
        // Use pattern because tests may be executed in different time zones
        const localDatePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/;

        expect(formatIsoDateTime(new Date('2021-09-23T17:57:16+09:00'))).toMatch(localDatePattern);
        expect(formatIsoDateTime(new Date())).toMatch(localDatePattern);
    });

    it('should validate pagination', () => {
        expect(validatePagination(undefined)).toBeNull();
        expect(validatePagination(null)).toBeNull();
        expect(validatePagination(1)).toBeNull();
        expect(validatePagination('a')).toBeNull();
        expect(validatePagination([])).toBeNull();
        expect(validatePagination({})).toEqual({});
        expect(validatePagination({foo: 123})).toEqual({});

        expect(
            validatePagination({
                offset: null,
                pageIndex: null,
                pageSize: null,
            }),
        ).toEqual({
            offset: null,
            pageIndex: null,
            pageSize: null,
        });

        expect(
            validatePagination({
                offset: undefined,
                pageIndex: undefined,
                pageSize: undefined,
            }),
        ).toEqual({});

        expect(
            validatePagination({
                offset: 1,
                pageIndex: 2,
                pageSize: 3,
            }),
        ).toEqual({
            offset: 1,
            pageIndex: 2,
            pageSize: 3,
        });

        expect(
            validatePagination({
                offset: 1,
                pageIndex: 2,
                pageSize: 3,
                foo: 123,
            }),
        ).toEqual({
            offset: 1,
            pageIndex: 2,
            pageSize: 3,
        });

        expect(
            validatePagination({
                offset: 'a',
                pageIndex: 'b',
                pageSize: 'c',
                foo: 123,
            }),
        ).toEqual({});
    });

    it('should validate pagination', () => {
        expect(validateSorting(undefined)).toBeNull();
        expect(validateSorting(null)).toBeNull();
        expect(validateSorting(1)).toBeNull();
        expect(validateSorting('a')).toBeNull();
        expect(validateSorting({})).toBeNull();
        expect(validateSorting([])).toEqual([]);
        expect(validateSorting([{foo: 123}, null])).toEqual([]);

        expect(
            validateSorting([
                {
                    field: 'myField',
                    order: null,
                    nullAsHighest: null,
                    emptyStringAsHighest: null,
                },
            ]),
        ).toEqual([
            {
                field: 'myField',
                order: null,
                nullAsHighest: null,
                emptyStringAsHighest: null,
            },
        ]);

        expect(
            validateSorting([
                {
                    field: 'myField',
                    order: undefined,
                    nullAsHighest: undefined,
                    emptyStringAsHighest: undefined,
                },
            ]),
        ).toEqual([
            {
                field: 'myField',
            },
        ]);

        expect(
            validateSorting([
                {
                    field: 'myField',
                    order: SortingOrder.ASC,
                    nullAsHighest: true,
                    emptyStringAsHighest: true,
                },
            ]),
        ).toEqual([
            {
                field: 'myField',
                order: SortingOrder.ASC,
                nullAsHighest: true,
                emptyStringAsHighest: true,
            },
        ]);

        expect(
            validateSorting([
                {
                    field: 'myField2',
                    order: SortingOrder.DESC,
                    nullAsHighest: false,
                    emptyStringAsHighest: false,
                },
            ]),
        ).toEqual([
            {
                field: 'myField2',
                order: SortingOrder.DESC,
                nullAsHighest: false,
                emptyStringAsHighest: false,
            },
        ]);

        expect(
            validateSorting([
                {
                    field: 'myField',
                    order: SortingOrder.ASC,
                    nullAsHighest: true,
                    emptyStringAsHighest: true,
                    foo: 123,
                },
                {foo: 123},
                null,
            ]),
        ).toEqual([
            {
                field: 'myField',
                order: SortingOrder.ASC,
                nullAsHighest: true,
                emptyStringAsHighest: true,
            },
        ]);

        expect(
            validateSorting([
                {
                    field: 'myField',
                    order: 'foo',
                    nullAsHighest: 'foo',
                    emptyStringAsHighest: 'foo',
                },
            ]),
        ).toEqual([
            {
                field: 'myField',
            },
        ]);
    });

    it('should validate columns', () => {
        expect(validateColumns(undefined)).toBeNull();
        expect(validateColumns(null)).toBeNull();
        expect(validateColumns(1)).toBeNull();
        expect(validateColumns({})).toBeNull();
        expect(validateColumns([])).toBeNull();

        expect(validateColumns('a')).toEqual(['a']);
        expect(validateColumns('a,b')).toEqual(['a', 'b']);
        expect(validateColumns('a,b,,,,')).toEqual(['a', 'b']);
    });
});
