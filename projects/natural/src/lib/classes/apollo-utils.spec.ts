import {hasFilesAndProcessDate} from './apollo-utils';

describe('hasFilesAndProcessDate', () => {
    // Use pattern because tests may be executed in different time zones
    const localDatePattern = /^"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\+|-)\d{2}:\d{2}"$/;

    beforeEach(() => {});

    it('should not find files in empty object', () => {
        const input = {};
        expect(hasFilesAndProcessDate(input)).toBe(false);
    });

    it('should find files', () => {
        const input = {
            file: new File([], 'image.jpg'),
        };
        expect(hasFilesAndProcessDate(input)).toBe(true);
    });

    it('should find blob', () => {
        const input = {
            file: new Blob(),
        };
        expect(hasFilesAndProcessDate(input)).toBe(true);
    });

    it('should find list of files', () => {
        const input = {
            date: new Date(),
        };
        const before = input.date;

        expect(hasFilesAndProcessDate(input)).toBe(false);
        expect(input.date).withContext('date is still the exact same instance of Date').toBe(before);
        expect(JSON.stringify(input.date))
            .withContext('but date is not serializable with local timezone')
            .toMatch(localDatePattern);
    });

    it('should still work with deep complex structure', () => {
        const input = {
            date1: new Date(),
            other: {
                upload: new File([], 'image.jpg'),
                date2: new Date(),
                foo: {
                    date3: new Date(),
                },
                date4: new Date(),
            },
        };
        const before = input.date1;

        expect(hasFilesAndProcessDate(input)).toBe(true);
        expect(input.date1).withContext('date is still the exact same instance of Date').toBe(before);
        expect(JSON.stringify(input.date1))
            .withContext('but date is not serializable with local timezone')
            .toMatch(localDatePattern);
        expect(JSON.stringify(input.other.date2))
            .withContext('but date is not serializable with local timezone')
            .toMatch(localDatePattern);
        expect(JSON.stringify(input.other.foo.date3))
            .withContext('but date is not serializable with local timezone')
            .toMatch(localDatePattern);
        expect(JSON.stringify(input.other.date4))
            .withContext('but date is not serializable with local timezone')
            .toMatch(localDatePattern);
    });
});
