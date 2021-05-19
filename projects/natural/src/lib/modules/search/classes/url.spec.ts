import {NaturalSearchSelections} from '../types/values';
import {fromUrl, toNavigationParameters, toUrl} from './url';

describe('toUrl', () => {
    it('should transform to URL back and forth', () => {
        const input: NaturalSearchSelections = [
            [
                {
                    field: 'visibility',
                    condition: {
                        in: {
                            values: ['private', 'member'],
                        },
                    },
                },
            ],
        ];

        const url = toUrl(input);
        expect(typeof url).toBe('string');

        // Original selection should not have been modified
        expect(input[0][0].field).toBe('visibility');

        const back = fromUrl(url);
        expect(back).toEqual(input);
    });

    it('should return null for null', () => {
        expect(toUrl(null)).toBeNull();
    });

    it('should return null for empty selection', () => {
        expect(toUrl([])).toBeNull();
    });

    it('should return null for empty group', () => {
        expect(toUrl([[]])).toBeNull();
    });
});

describe('fromUrl', () => {
    it('should return empty selection for null', () => {
        expect(fromUrl(null)).toEqual([[]]);
    });

    it('should return empty selection for empty string', () => {
        expect(fromUrl('')).toEqual([[]]);
    });

    it('should return empty selection for empty selection', () => {
        expect(fromUrl('[]')).toEqual([[]]);
    });

    it('should return empty selection for empty group', () => {
        expect(fromUrl('[[]]')).toEqual([[]]);
    });
});

describe('toNavigationParameters', () => {
    it('should return navigation parameters', () => {
        const input: NaturalSearchSelections = [
            [
                {
                    field: 'visibility',
                    condition: {
                        in: {
                            values: ['private', 'member'],
                        },
                    },
                },
            ],
        ];

        expect(toNavigationParameters(input)).toEqual({
            ns: '"[[{\\"f\\":\\"visibility\\",\\"c\\":{\\"in\\":{\\"values\\":[\\"private\\",\\"member\\"]}}}]]"',
        });
    });

    it('if given no selection should return empty navigation parameters', () => {
        expect(toNavigationParameters([])).toEqual({});
    });
});
