import {NaturalTimeAgoPipe} from './time-ago.pipe';

describe('NaturalTimeAgoPipe', () => {
    it('create an instance', () => {
        const pipe = new NaturalTimeAgoPipe();
        expect(pipe).toBeTruthy();
    });

    const cases: [string, string][] = [
        // Past
        ['2005-06-15T06:30:30', 'il y a 5 ans'],
        ['2009-06-14T06:30:30', 'il y a un an'],
        ['2010-04-13T06:30:30', 'il y a 2 mois'],
        ['2010-05-14T06:30:30', 'il y a un mois'],
        ['2010-05-31T06:30:30', 'il y a 2 semaines'],
        ['2010-06-07T06:30:30', 'il y a une semaine'],
        ['2010-06-13T06:30:30', 'il y a 2 jours'],
        ['2010-06-14T06:30:30', 'il y a un jour'],
        ['2010-06-15T03:30:30', 'il y a 3 heures'],
        ['2010-06-15T05:30:30', 'il y a une heure'],
        ['2010-06-15T06:15:30', 'il y a 15 minutes'],
        ['2010-06-15T06:25:30', 'il y a 5 minutes'],
        ['2010-06-15T06:29:30', 'il y a quelques minutes'],
        ['2010-06-15T06:30:20', 'il y a quelques minutes'],
        // Now ! Assumes nobody will actually read the text before a few seconds/minutes pass, so even "now" is a few minutes ago
        ['2010-06-15T06:30:30', 'il y a quelques minutes'],
        // Future
        ['2010-06-15T06:30:31', 'dans quelques minutes'],
        ['2010-06-15T06:32:40', 'dans quelques minutes'],
        ['2010-06-15T06:35:31', 'dans 5 minutes'],
        ['2010-06-15T06:45:30', 'dans 15 minutes'],
        ['2010-06-15T07:30:31', 'dans une heure'],
        ['2010-06-15T09:30:30', 'dans 3 heures'],
        ['2010-06-16T06:30:31', 'dans un jour'],
        ['2010-06-17T06:30:31', 'dans 2 jours'],
        ['2010-06-22T06:30:31', 'dans une semaine'],
        ['2010-06-29T06:30:31', 'dans 2 semaines'],
        ['2010-07-16T06:30:31', 'dans un mois'],
        ['2010-08-16T06:30:31', 'dans 2 mois'],
        ['2011-06-15T06:30:31', 'dans un an'],
        ['2012-06-15T06:30:30', 'dans 2 ans'],
        ['2010-06-18', 'dans 3 jours'],
    ];

    cases.forEach(parameters => {
        it('with ' + JSON.stringify(parameters), () => {
            const pipe = new NaturalTimeAgoPipe(Date.parse('2010-06-15T06:30:30'));
            expect(pipe.transform(new Date(parameters[0]))).toBe(parameters[1]);
            expect(pipe.transform(parameters[0])).toBe(parameters[1]);
        });
    });

    it('with empty value', () => {
        const pipe = new NaturalTimeAgoPipe();
        expect(pipe.transform(null)).toBe('');
        expect(pipe.transform(undefined)).toBe('');
        expect(pipe.transform('')).toBe('');
    });
});
