import {fakeAsync, inject, TestBed, tick} from '@angular/core/testing';
import {MockApolloProvider} from '../testing/mock-apollo.provider';
import {IEnum, NaturalEnumService} from './enum.service';

describe('NaturalEnumService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [MockApolloProvider],
        });
    });

    it('should be created', fakeAsync(
        inject([NaturalEnumService], (service: NaturalEnumService) => {
            expect(service).toBeTruthy();

            const expected: IEnum[] = [
                {
                    value: 'value1',
                    name: 'Description 1',
                },
                {
                    value: 'value2',
                    name: 'Description 2',
                },
            ];

            let actual: any = null;
            const observable = service.get('MyEnum');

            observable.subscribe(v => (actual = v));
            tick();

            expect(actual).toEqual(expected);
        }),
    ));
});
