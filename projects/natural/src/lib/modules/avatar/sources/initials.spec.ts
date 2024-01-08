import {Initials} from './initials';

describe('Initials', () => {
    const cases: [string, string][] = [
        ['John Doe', 'JD'],
        ['john doe', 'JD'], // To uppercase
        ['John', 'J'],
        ['John ', 'J'],
        ['   John   Doe   ', 'JD'], // Extra whitespaces are ignored
        ['Jean-Nicholas Rodriguez Gonzales', 'JR'], // Dash is part of single composed words
        ['Jean-Nicholas Rodriguez-Gonzales', 'JR'],
        ['John - Rodriguez', 'JR'], // Dash use as separator is ignored
        ['John _ Rodriguez', 'JR'], // Idem with underscore
        ['John - Rodriguez Gonzales', 'JR'],
        ['Jane Smith (-Doe)', 'JS'], // Content in parentheses is dropped because assumed less important
        ['7 Nains', '7N'], // Numbers are OK
        ['0livi2r Hax0r', '0H'], // 1337 speak is rad
        ['Élodie Doe', 'ÉD'], // Unicode is OK
        ['Élodie Élodie', 'ÉÉ'],
        ['Abracadabra', 'A'],
        ['[fiche archivée]', 'FA'], // Non-letters are dropped
        ['John (and Jane) Doe', 'JD'],
        ['Albert Einstein (archivé)', 'AE'],
        ['Alice & Bob', 'AB'],
        ['Alice / Bob / Charlie', 'AB'],
        ['상어 심', '상심'],
        ['?', '?'], // Deliberately short name is kept intact
        ['ab', 'AB'], // Idem
        ['PR', 'PR'],
        ['NA', 'NA'],
        [' ', ''],
    ];

    cases.forEach(([input, expected]) => {
        it(`should return initials for '${input}'`, () => {
            const initials = new Initials(input);
            expect(initials.getAvatar(2)).toBe(expected);
        });
    });
});
