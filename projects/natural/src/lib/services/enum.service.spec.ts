import { inject, TestBed } from '@angular/core/testing';
import { NaturalEnumService } from './enum.service';
import { MockApolloProvider } from '../../shared/testing/MockApolloProvider';

describe('NaturalEnumService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                MockApolloProvider,
            ],
        });
    });

    it('should be created', inject([NaturalEnumService], (service: NaturalEnumService) => {
        expect(service).toBeTruthy();

        const expected = [
            {
                value: 'application',
                name: 'Demande en attente',
            },
            {
                value: 'processed',
                name: 'Demande traitée',
            },
            {
                value: 'booked',
                name: 'Réservation',
            },
        ];

        const actual = service.get('BookingStatus');
        actual.subscribe(v => expect(v).toEqual(expected));
    }));
});
